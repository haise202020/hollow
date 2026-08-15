import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { formatBrl } from "@/lib/data/catalog";
import {
  getOrder,
  safeTokenEqual,
  updateOrderStatus,
} from "@/lib/orders/store";
import {
  checkPixTransaction,
  normalizePaymentStatus,
} from "@/lib/payments/misticpay";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";

function amountsMatch(expectedBrl: number, observed: number): boolean {
  if (!Number.isFinite(observed) || observed <= 0) return false;
  return Math.abs(observed - expectedBrl) < 0.02;
}

export async function GET(request: Request) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(`checkout-status:${ip}`, 60, 60_000);

  if (!limited.success) {
    return NextResponse.json(
      { error: "Muitas consultas. Aguarde um instante." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const orderId = sanitizeText(searchParams.get("orderId") ?? "", 80);
  const viewToken = sanitizeText(searchParams.get("token") ?? "", 128);

  if (!orderId.startsWith("hlw_")) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const order = await getOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const session = await getSession();
  const tokenOk = safeTokenEqual(viewToken, order.viewToken);
  const ownerOk = Boolean(
    session?.sub && order.accountUserId && session.sub === order.accountUserId,
  );

  if (!tokenOk && !ownerOk) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  let fresh = order;

  if (order.status === "PENDENTE" && order.misticTransactionId) {
    try {
      const checked = await checkPixTransaction(order.misticTransactionId);
      const nextStatus = normalizePaymentStatus(checked.transactionState);

      if (
        nextStatus === "COMPLETO" &&
        !amountsMatch(order.amountBrl, checked.value)
      ) {
        // Valor divergente do gateway — não promove o pedido.
      } else if (nextStatus !== order.status) {
        const updated = await updateOrderStatus(order.id, nextStatus);
        if (updated) {
          fresh = updated;
          void import("@/lib/discord/bot")
            .then(({ refreshOrderDiscordMessage }) =>
              refreshOrderDiscordMessage(updated),
            )
            .catch(() => undefined);
        }
      }
    } catch {
      // Keep last known status if gateway is temporarily unavailable.
    }
  }

  return NextResponse.json({
    ok: true,
    order: {
      id: fresh.id,
      status: fresh.status,
      adminStatus: fresh.adminStatus ?? "AGUARDANDO",
      productLabel: fresh.productLabel,
      amountBrl: fresh.amountBrl,
      amountFormatted: formatBrl(fresh.amountBrl),
      robloxUsername: fresh.robloxUsername,
      copyPaste: fresh.copyPaste,
      qrCodeBase64: fresh.qrCodeBase64,
      qrcodeUrl: fresh.qrcodeUrl,
      viewToken: fresh.viewToken,
    },
  });
}
