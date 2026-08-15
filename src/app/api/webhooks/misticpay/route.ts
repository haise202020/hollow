import { NextResponse } from "next/server";
import { z } from "zod";
import {
  findOrderByMisticId,
  getOrder,
  updateOrderStatus,
} from "@/lib/orders/store";
import { normalizePaymentStatus } from "@/lib/payments/misticpay";
import { timingSafeEqual } from "node:crypto";

const bodySchema = z.object({
  transactionId: z.union([z.string(), z.number()]).optional(),
  status: z.string().optional(),
  transactionState: z.string().optional(),
  transactionType: z.string().optional(),
  value: z.number().optional(),
  event: z.string().optional(),
});

function extractStatus(body: z.infer<typeof bodySchema>): string {
  return String(body.status ?? body.transactionState ?? "PENDENTE");
}

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function amountsMatch(expectedBrl: number, observed: number | undefined): boolean {
  if (observed === undefined) return true; // gateway às vezes omite value
  if (!Number.isFinite(observed) || observed <= 0) return false;
  return Math.abs(observed - expectedBrl) < 0.02;
}

export async function POST(request: Request) {
  const configuredSecret = process.env.MISTICPAY_WEBHOOK_SECRET?.trim();
  if (!configuredSecret) {
    console.error("[webhook/misticpay] MISTICPAY_WEBHOOK_SECRET não configurado.");
    return NextResponse.json(
      { error: "Webhook não configurado." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const provided =
    request.headers.get("x-webhook-secret") ?? searchParams.get("secret");

  if (!secretMatches(provided, configuredSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
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

  const misticId = body.transactionId != null ? String(body.transactionId) : "";
  if (!misticId) {
    return NextResponse.json({ error: "transactionId ausente." }, { status: 400 });
  }

  const status = normalizePaymentStatus(extractStatus(body));
  const order =
    (await findOrderByMisticId(misticId)) ??
    (misticId.startsWith("hlw_") ? await getOrder(misticId) : null);

  if (!order) {
    return NextResponse.json({ ok: true, matched: false });
  }

  if (status === "COMPLETO" && !amountsMatch(order.amountBrl, body.value)) {
    console.error(
      `[webhook/misticpay] Valor divergente pedido=${order.id} esperado=${order.amountBrl} recebido=${body.value}`,
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
