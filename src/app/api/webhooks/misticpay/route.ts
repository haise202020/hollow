import { NextResponse } from "next/server";
import { z } from "zod";
import {
  findOrderByTransactionId,
  getOrder,
  updateOrderStatus,
} from "@/lib/orders/store";
import { normalizePaymentStatus } from "@/lib/payments/sevenpay";
import { timingSafeEqual } from "node:crypto";

const bodySchema = z.object({
  id: z.string().optional(),
  transactionId: z.union([z.string(), z.number()]).optional(),
  status: z.string().optional(),
  transactionState: z.string().optional(),
  amount: z.number().optional(),
  value: z.number().optional(),
  event: z.string().optional(),
  pix: z
    .object({
      id: z.string().optional(),
      status: z.string().optional(),
      amount: z.number().optional(),
    })
    .optional(),
});

function extractStatus(body: z.infer<typeof bodySchema>): string {
  return String(
    body.status ??
      body.transactionState ??
      body.pix?.status ??
      "PENDENTE",
  );
}

function extractTransactionId(body: z.infer<typeof bodySchema>): string {
  const candidates = [
    body.id,
    body.pix?.id,
    body.transactionId != null ? String(body.transactionId) : undefined,
  ];
  for (const c of candidates) {
    if (c && typeof c === "string" && c.trim()) return c.trim();
  }
  return "";
}

function extractAmount(body: z.infer<typeof bodySchema>): number | undefined {
  return body.amount ?? body.pix?.amount ?? body.value;
}

function amountsMatch(expectedBrl: number, observed: number | undefined): boolean {
  if (observed === undefined) return true;
  if (!Number.isFinite(observed) || observed <= 0) return false;
  return Math.abs(observed - expectedBrl) < 0.02;
}

/**
 * Valida assinatura do webhook usando HMAC-SHA256.
 * O gateway deve enviar header X-Signature com HMAC do body.
 */
async function verifyWebhookSignature(
  request: Request,
  body: string,
): Promise<boolean> {
  const secret = process.env.SEVENPAY_WEBHOOK_SECRET?.trim();

  // Se não há secret configurado, log warning mas permite (backward compat)
  if (!secret) {
    console.warn(
      "[webhook] SEVENPAY_WEBHOOK_SECRET não configurado. Webhook sem autenticação!",
    );
    return true;
  }

  const signature = request.headers.get("x-signature");
  if (!signature) {
    console.error("[webhook] Header X-Signature ausente");
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const expectedSignature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(body),
    );

    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Timing-safe comparison
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedHex, "hex");

    if (sigBuffer.length !== expectedBuffer.length) {
      console.error("[webhook] Tamanho de assinatura inválido");
      return false;
    }

    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch (error) {
    console.error("[webhook] Erro ao validar assinatura:", error);
    return false;
  }
}

export async function POST(request: Request) {
  // Ler body como texto para validar assinatura
  const bodyText = await request.text();

  // Validar assinatura do webhook ANTES de processar
  const signatureValid = await verifyWebhookSignature(request, bodyText);
  if (!signatureValid) {
    console.error("[webhook] Assinatura inválida - possível fraude");
    return NextResponse.json(
      { error: "Assinatura inválida." },
      { status: 401 },
    );
  }

  let raw: unknown;
  try {
    raw = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const body = parsed.data;

  if (body.event === "INFRACTION") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const transactionId = extractTransactionId(body);
  if (!transactionId) {
    return NextResponse.json(
      { error: "transactionId ausente." },
      { status: 400 },
    );
  }

  const status = normalizePaymentStatus(extractStatus(body));
  const order =
    (await findOrderByTransactionId(transactionId)) ??
    (transactionId.startsWith("hlw_") ? await getOrder(transactionId) : null);

  if (!order) {
    return NextResponse.json({ ok: true, matched: false });
  }

  // Idempotência: se já está COMPLETO, não processa novamente
  if (order.status === "COMPLETO" && status === "COMPLETO") {
    return NextResponse.json({
      ok: true,
      matched: true,
      orderId: order.id,
      status: order.status,
      idempotent: true,
    });
  }

  const observedAmount = extractAmount(body);
  if (status === "COMPLETO" && !amountsMatch(order.amountBrl, observedAmount)) {
    console.error(
      `[webhook/sevenpay] Valor divergente pedido=${order.id} esperado=${order.amountBrl} recebido=${observedAmount}`,
    );
    return NextResponse.json(
      { error: "Valor do pagamento não confere." },
      { status: 409 },
    );
  }

  const updated = await updateOrderStatus(order.id, status);
  if (updated) {
    void import("@/lib/discord/bot")
      .then(({ refreshOrderDiscordMessage }) =>
        refreshOrderDiscordMessage(updated),
      )
      .catch(() => undefined);
  }

  return NextResponse.json({
    ok: true,
    matched: true,
    orderId: order.id,
    status,
  });
}