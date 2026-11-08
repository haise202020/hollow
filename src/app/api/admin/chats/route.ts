import { NextResponse } from "next/server";
import { isAdminDiscordId } from "@/lib/auth/admin";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/mongodb";

export async function GET() {
  const session = await getSession();

  if (!session || !isAdminDiscordId(session.discordId)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const db = await getDb();

    // Busca todos os pedidos que têm mensagens de chat, com dados do pedido e última mensagem
    const chats = await db
      .collection("chat_messages")
      .aggregate([
        {
          $group: {
            _id: "$orderId",
            lastMessageAt: { $max: "$createdAt" },
            lastSender: { $last: "$sender" },
            messageCount: { $sum: 1 },
          },
        },
        { $sort: { lastMessageAt: -1 } },
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "id",
            as: "order",
          },
        },
        { $unwind: "$order" },
        {
          $project: {
            orderId: "$_id",
            lastMessageAt: 1,
            lastSender: 1,
            messageCount: 1,
            robloxUsername: "$order.robloxUsername",
            productLabel: "$order.productLabel",
            amountBrl: "$order.amountBrl",
            adminStatus: "$order.adminStatus",
            status: "$order.status",
            createdAt: "$order.createdAt",
          },
        },
      ])
      .toArray();

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("[admin/chats]", error);
    return NextResponse.json(
      { error: "Erro ao carregar chats." },
      { status: 500 },
    );
  }
}