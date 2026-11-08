import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db/mongodb";
import type { ChatMessage, ChatThread } from "./types";

const COLLECTION = "chat_messages";

async function messages() {
  const db = await getDb();
  const col = db.collection<ChatMessage>(COLLECTION);
  await col.createIndex({ orderId: 1, createdAt: 1 }).catch(() => undefined);
  return col;
}

export async function addChatMessage(input: {
  orderId: string;
  sender: "customer" | "admin" | "system";
  senderId?: string;
  senderName: string;
  content: string;
  isAutoMessage?: boolean;
}): Promise<ChatMessage> {
  const col = await messages();
  const msg: ChatMessage = {
    id: `msg_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    orderId: input.orderId,
    sender: input.sender,
    senderId: input.senderId,
    senderName: input.senderName,
    content: input.content,
    isAutoMessage: input.isAutoMessage ?? false,
    createdAt: new Date().toISOString(),
  };
  await col.insertOne(msg);
  return msg;
}

export async function getChatMessages(orderId: string): Promise<ChatMessage[]> {
  const col = await messages();
  return col.find({ orderId }).sort({ createdAt: 1 }).toArray();
}

export async function getOrderIdsWithActivity(): Promise<string[]> {
  const col = await messages();
  const docs = await col
    .aggregate([
      { $group: { _id: "$orderId", lastMessageAt: { $max: "$createdAt" } } },
      { $sort: { lastMessageAt: -1 } },
    ])
    .toArray();
  return docs.map((d) => d._id as string);
}