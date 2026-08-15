import { NextResponse } from "next/server";
import { getSession, publicUserFromSession } from "@/lib/auth/session";
import { userHasPassword } from "@/lib/auth/users";
import { formatBrl } from "@/lib/data/catalog";
import {
  deliveryLabel,
  isPaidLike,
  isPendingOrder,
  statusTone,
} from "@/lib/orders/presentation";
import { listOrdersByAccountUserId } from "@/lib/orders/store";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  const orders = await listOrdersByAccountUserId(session.sub, 80);
  const hasPassword = await userHasPassword(session.sub);

  const paidOrApproved = orders.filter(isPaidLike);
  const pending = orders.filter(isPendingOrder);
  const delivered = orders.filter((order) => order.adminStatus === "APROVADO");

  const totalSpentBrl = paidOrApproved.reduce(
    (sum, order) => sum + (order.amountBrl || 0),
    0,
  );
  const totalRobux = paidOrApproved.reduce(
    (sum, order) => sum + (order.robuxAmount || 0),
    0,
  );

  const mapped = orders.map((order) => ({
    id: order.id,
    type: order.type,
    productLabel: order.productLabel,
    amountBrl: order.amountBrl,
    amountFormatted: formatBrl(order.amountBrl),
    robuxAmount: order.robuxAmount ?? null,
    robloxUsername: order.robloxUsername,
    robloxGamepassId: order.robloxGamepassId ?? null,
    gamepassId: order.gamepassId ?? null,
    status: order.status,
    adminStatus: order.adminStatus,
    deliveryLabel: deliveryLabel(order),
    statusTone: statusTone(order),
    pending: isPendingOrder(order),
    createdAt: order.createdAt,
    createdAtFormatted: new Date(order.createdAt).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return NextResponse.json({
    ok: true,
    user: {
      ...publicUserFromSession(session),
      hasPassword,
    },
    stats: {
      totalOrders: orders.length,
      pendingOrders: pending.length,
      deliveredOrders: delivered.length,
      totalSpentBrl,
      totalSpentFormatted: formatBrl(totalSpentBrl),
      totalRobux,
      averageTicketFormatted: formatBrl(
        paidOrApproved.length
          ? totalSpentBrl / paidOrApproved.length
          : 0,
      ),
    },
    orders: mapped,
  });
}
