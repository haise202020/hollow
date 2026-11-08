import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { resolveDisplayName } from "@/lib/auth/types";
import { findUserByUsername } from "@/lib/auth/users";
import { assertCsrf, CSRF_COOKIE } from "@/lib/security/csrf-core";
import { ensureCsrfCookie } from "@/lib/security/csrf";
import {
  clearAuthFailures,
  getAuthBackoffMs,
  getClientIp,
  rateLimit,
  recordAuthFailure,
} from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";

const bodySchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(`auth-login:${ip}`, 12, 60_000);
  if (!limited.success) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieToken = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CSRF_COOKIE}=`))
    ?.split("=")[1];

  if (!(await assertCsrf(request, cookieToken))) {
    await ensureCsrfCookie();
    return NextResponse.json(
      { error: "Token CSRF expirado. Tente novamente." },
      { status: 419 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const parsed = bodySchema.safeParse({
    username: sanitizeText(String(raw.username ?? ""), 20),
    password: String(raw.password ?? ""),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  // Apply progressive backoff for repeated failures from this IP+username
  const authKey = `login:${ip}:${parsed.data.username.toLowerCase()}`;
  const backoffMs = getAuthBackoffMs(authKey);
  if (backoffMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, Math.min(backoffMs, 5000)));
  }

  try {
    const user = await findUserByUsername(parsed.data.username);
    if (!user?.passwordHash) {
      recordAuthFailure(authKey);
      return NextResponse.json(
        { error: "Usuário ou senha incorretos." },
        { status: 401 },
      );
    }

    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
      recordAuthFailure(authKey);
      return NextResponse.json(
        { error: "Usuário ou senha incorretos." },
        { status: 401 },
      );
    }

    // Clear failure counter on successful login
    clearAuthFailures(authKey);

    const publicUser = {
      id: user.id,
      username: user.username,
      displayName: resolveDisplayName(user),
      email: user.email ?? null,
      discordId: user.discordId ?? null,
      discordUsername: user.discordUsername ?? null,
      avatarUrl: user.avatarUrl ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const token = await createSessionToken(publicUser);
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      user: {
        id: publicUser.id,
        username: publicUser.username,
        displayName: publicUser.displayName,
        email: publicUser.email,
        avatarUrl: publicUser.avatarUrl,
      },
    });
  } catch (error) {
    console.error("[auth/login]", error);
    return NextResponse.json(
      { error: "Falha ao entrar. Tente novamente." },
      { status: 502 },
    );
  }
}
