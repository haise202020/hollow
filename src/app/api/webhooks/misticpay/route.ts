import { NextResponse } from "next/server";
import { z } from "zod";
import {
  findOrderByTransactionId,
  getOrder,
  updateOrderStatus,
} from "@/lib/orders/store";
import { normalizePaymentStatus } from "@/lib/payments/sevenpay";

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

export async function POST(request: Request) {
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
