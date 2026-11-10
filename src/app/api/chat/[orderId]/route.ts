import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getChatMessages, addChatMessage } from "@/lib/chat/store";
import { isAdminDiscordId } from "@/lib/auth/admin";
import { findOrderById } from "@/lib/orders/store";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";

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

  // Rate limiting por usuário (não admin) para prevenir spam/flood
  if (!isAdmin) {
    const ip = getClientIp(request.headers);
    const chatKey = `chat-msg:${session.sub}:${ip}`;
    const limited = rateLimit(chatKey, 10, 60_000); // 10 mensagens/minuto
    if (!limited.success) {
      return NextResponse.json(
        { error: "Muitas mensagens. Aguarde um momento." },
        { status: 429 },
      );
    }
  }

  const body = (await request.json()) as { content?: string };
  const rawContent = String(body.content ?? "");
  const content = sanitizeText(rawContent, 2000);
  if (!content) {
    return NextResponse.json(
      { error: "Mensagem vazia ou inválida." },
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