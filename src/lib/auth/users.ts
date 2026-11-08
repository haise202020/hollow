import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db/mongodb";
import {
  discordAccountUsername,
  isReservedUsername,
  resolveDisplayName,
  type AuthUser,
  type UserDocument,
} from "./types";

const COLLECTION = "users";

async function users() {
  const db = await getDb();
  const col = db.collection<UserDocument>(COLLECTION);
  await col.createIndex({ username: 1 }, { unique: true }).catch(() => undefined);
  await col
    .createIndex({ discordId: 1 }, { unique: true, sparse: true })
    .catch(() => undefined);
  return col;
}

function toPublicUser(doc: UserDocument): AuthUser {
  return {
    id: doc.id,
    username: doc.username,
    displayName: resolveDisplayName(doc),
    email: doc.email ?? null,
    discordId: doc.discordId ?? null,
    discordUsername: doc.discordUsername ?? null,
    avatarUrl: doc.avatarUrl ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function findUserByUsername(
  username: string,
): Promise<UserDocument | null> {
  const col = await users();
  return col.findOne(
    { username: username.toLowerCase() },
    { projection: { _id: 0 } },
  );
}

export async function findUserById(id: string): Promise<UserDocument | null> {
  const col = await users();
  return col.findOne({ id }, { projection: { _id: 0 } });
}

export async function findUserByDiscordId(
  discordId: string,
): Promise<UserDocument | null> {
  const col = await users();
  return col.findOne({ discordId }, { projection: { _id: 0 } });
}

export async function createUserWithPassword(input: {
  username: string;
  passwordHash: string;
  email?: string;
}): Promise<AuthUser> {
  const username = input.username.toLowerCase();
  if (isReservedUsername(username)) {
    throw new Error("USERNAME_RESERVED");
  }

  const col = await users();
  const now = new Date().toISOString();

  // Omitir discordId/discordUsername quando null para evitar colisão
  // com índice único não-sparse no MongoDB Atlas (E11000 dup key: { discordId: null })
  const doc: UserDocument = {
    id: `usr_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    username,
    email: input.email?.toLowerCase() || null,
    passwordHash: input.passwordHash,
    avatarUrl: null,
    createdAt: now,
    updatedAt: now,
  } as UserDocument;

  try {
    await col.insertOne(doc);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("E11000") || message.includes("duplicate")) {
      throw new Error("USERNAME_TAKEN");
    }
    throw error;
  }

  return toPublicUser(doc);
}

export async function userHasPassword(userId: string): Promise<boolean> {
  const doc = await findUserById(userId);
  return Boolean(doc?.passwordHash);
}

export async function updateUserPassword(
  userId: string,
  passwordHash: string,
): Promise<void> {
  const col = await users();
  const existing = await findUserById(userId);
  if (!existing) throw new Error("USER_NOT_FOUND");
  if (!existing.passwordHash) throw new Error("NO_PASSWORD");

  const now = new Date().toISOString();
  await col.updateOne(
    { id: userId },
    { $set: { passwordHash, updatedAt: now } },
  );
}

export async function upsertDiscordUser(input: {
  discordId: string;
  discordUsername: string;
  email?: string | null;
  avatarUrl?: string | null;
}): Promise<AuthUser> {
  const col = await users();
  const existing = await findUserByDiscordId(input.discordId);
  const now = new Date().toISOString();
  const canonicalUsername = discordAccountUsername(input.discordId);

  if (existing) {
    await col.updateOne(
      { id: existing.id },
      {
        $set: {
          username: canonicalUsername,
          discordUsername: input.discordUsername,
          email: input.email ?? existing.email ?? null,
          avatarUrl: input.avatarUrl ?? existing.avatarUrl ?? null,
          updatedAt: now,
        },
      },
    );
    const fresh = await findUserById(existing.id);
    return toPublicUser(fresh ?? { ...existing, username: canonicalUsername });
  }

  // Se alguém tentou reservar o username interno, força o canônico por discordId.
  const clash = await findUserByUsername(canonicalUsername);
  if (clash && clash.discordId !== input.discordId) {
    throw new Error("DISCORD_USERNAME_CONFLICT");
  }

  const doc: UserDocument = {
    id: `usr_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    username: canonicalUsername,
    email: input.email ?? null,
    passwordHash: null,
    discordId: input.discordId,
    discordUsername: input.discordUsername,
    avatarUrl: input.avatarUrl ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await col.insertOne(doc);
  return toPublicUser(doc);
}
