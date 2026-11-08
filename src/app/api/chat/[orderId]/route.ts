import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getChatMessages, addChatMessage } from "@/lib/chat/store";
import { isAdminDiscordId } from "@/lib/auth/admin";
import { findOrderById } from "@/lib/orders/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const order = await findOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  // Cliente só acessa seus próprios pedidos; admin acessa qualquer um
  const isAdmin = isAdminDiscordId(session.discordId);
  const isOwner = order.accountUserId && order.accountUserId === session.sub;
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const messages = await getChatMessages(orderId);
  return NextResponse.json({ messages });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const order = await findOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const isAdmin = isAdminDiscordId(session.discordId);
  const isOwner = order.accountUserId && order.accountUserId === session.sub;
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = (await request.json()) as { content?: string };
  const content = (body.content ?? "").trim();
  if (!content || content.length > 2000) {
    return NextResponse.json(
      { error: "Mensagem vazia ou muito longa." },
      { status: 400 },
    );
  }

  const msg = await addChatMessage({
    orderId,
    sender: isAdmin ? "admin" : "customer",
    senderId: isAdmin ? session.discordId! : session.sub,
    senderName: isAdmin
      ? session.displayName || "Admin Hollow"
      : session.displayName || order.robloxUsername,
    content,
  });

  return NextResponse.json({ message: msg });
}