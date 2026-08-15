import { timingSafeEqual, randomBytes, randomUUID } from "node:crypto";
import { getDb } from "@/lib/db/mongodb";
import type { AdminStatus, Order, OrderStatus } from "./types";

const COLLECTION = "orders";

export function createOrderId(): string {
  return `hlw_${randomUUID().replace(/-/g, "")}`;
}

export function createOrderViewToken(): string {
  return randomBytes(32).toString("hex");
}

export function safeTokenEqual(
  provided: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function orders() {
  const db = await getDb();
  const col = db.collection<Order>(COLLECTION);
  await Promise.all([
    col.createIndex({ id: 1 }, { unique: true }).catch(() => undefined),
    col
      .createIndex(
        { misticTransactionId: 1 },
        { unique: true, sparse: true },
      )
      .catch(() => undefined),
    col
      .createIndex({ accountUserId: 1, createdAt: -1 })
      .catch(() => undefined),
  ]);
  return col;
}

export async function saveOrder(order: Order): Promise<Order> {
  const col = await orders();
  await col.updateOne({ id: order.id }, { $set: order }, { upsert: true });
  return order;
}

export async function getOrder(id: string): Promise<Order | null> {
  const col = await orders();
  const doc = await col.findOne({ id }, { projection: { _id: 0 } });
  return doc ?? null;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  patch?: Partial<Order>,
): Promise<Order | null> {
  const col = await orders();
  const current = await col.findOne({ id }, { projection: { _id: 0 } });
  if (!current) return null;

  // Não reabrir pedido já pago via race de webhook/poll.
  if (
    current.status === "COMPLETO" &&
    (status === "PENDENTE" || status === "FALHA" || status === "CANCELADO")
  ) {
    return current;
  }

  const { _id: _ignored, ...safePatch } = (patch ?? {}) as Partial<Order> & {
    _id?: unknown;
  };
  void _ignored;

  const updatedAt = new Date().toISOString();
  const result = await col.findOneAndUpdate(
    { id },
    {
      $set: {
        ...safePatch,
        status,
        updatedAt,
      },
    },
    { returnDocument: "after", projection: { _id: 0 } },
  );

  return result ?? null;
}

export async function updateOrderAdmin(
  id: string,
  adminStatus: AdminStatus,
  meta?: { approvedBy?: string },
): Promise<Order | null> {
  const col = await orders();
  const updatedAt = new Date().toISOString();

  const result = await col.findOneAndUpdate(
    { id, adminStatus: "AGUARDANDO" },
    {
      $set: {
        adminStatus,
        approvedBy: meta?.approvedBy,
        approvedAt: updatedAt,
        updatedAt,
      },
    },
    { returnDocument: "after", projection: { _id: 0 } },
  );

  return result ?? null;
}

export async function findOrderByMisticId(
  misticTransactionId: string,
): Promise<Order | null> {
  const col = await orders();
  const doc = await col.findOne(
    { misticTransactionId },
    { projection: { _id: 0 } },
  );
  return doc ?? null;
}

export async function listOrdersByAccountUserId(
  accountUserId: string,
  limit = 50,
): Promise<Order[]> {
  const col = await orders();
  return col
    .find(
      { accountUserId },
      {
        projection: {
          _id: 0,
          copyPaste: 0,
          qrCodeBase64: 0,
          qrcodeUrl: 0,
          payerDocument: 0,
          viewToken: 0,
        },
      },
    )
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}
