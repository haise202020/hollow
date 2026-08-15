import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { AuthUser } from "./types";
import { resolveDisplayName } from "./types";

export const SESSION_COOKIE = "hollow_session";
const SESSION_DAYS = 14;

function getAuthSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET?.trim() ||
    process.env.CSRF_SECRET?.trim() ||
    (process.env.NODE_ENV === "production"
      ? ""
      : "hollow-dev-auth-secret-change-me-32chars");

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET (ou CSRF_SECRET) inválido para sessões.");
  }

  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  username: string;
  displayName: string;
  email?: string | null;
  discordId?: string | null;
  avatarUrl?: string | null;
};

export async function createSessionToken(user: AuthUser): Promise<string> {
  const displayName = user.displayName || resolveDisplayName(user);
  return new SignJWT({
    username: user.username,
    displayName,
    email: user.email ?? null,
    discordId: user.discordId ?? null,
    avatarUrl: user.avatarUrl ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getAuthSecret());
}

export async function readSessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    if (!payload.sub || typeof payload.username !== "string") return null;

    const displayName =
      typeof payload.displayName === "string" && payload.displayName
        ? payload.displayName
        : payload.username;

    return {
      sub: payload.sub,
      username: payload.username,
      displayName,
      email: typeof payload.email === "string" ? payload.email : null,
      discordId:
        typeof payload.discordId === "string" ? payload.discordId : null,
      avatarUrl:
        typeof payload.avatarUrl === "string" ? payload.avatarUrl : null,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

export function publicUserFromSession(session: SessionPayload) {
  return {
    id: session.sub,
    username: session.username,
    displayName: session.displayName,
    email: session.email ?? null,
    discordId: session.discordId ?? null,
    avatarUrl: session.avatarUrl ?? null,
  };
}
