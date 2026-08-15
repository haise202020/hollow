import { NextResponse } from "next/server";
import { z } from "zod";
import { isReservedUsername } from "@/lib/auth/types";
import { hashPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { createUserWithPassword } from "@/lib/auth/users";
import { assertCsrf, CSRF_COOKIE } from "@/lib/security/csrf-core";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";

const bodySchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e _"),
  password: z.string().min(8).max(72),
  email: z.string().email().optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(`auth-register:${ip}`, 8, 60_000);
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
    return NextResponse.json({ error: "Token CSRF inválido." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const emailRaw =
    raw.email === undefined || raw.email === null
      ? undefined
      : sanitizeText(String(raw.email), 120).trim();
  const parsed = bodySchema.safeParse({
    username: sanitizeText(String(raw.username ?? ""), 20),
    password: String(raw.password ?? ""),
    email: emailRaw ? emailRaw : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (isReservedUsername(parsed.data.username)) {
    return NextResponse.json(
      {
        error:
          "Esse nome é reservado para contas Discord. Escolha outro usuário.",
      },
      { status: 409 },
    );
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const user = await createUserWithPassword({
      username: parsed.data.username,
      passwordHash,
      email: parsed.data.email || undefined,
    });

    const token = await createSessionToken(user);
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USERNAME_TAKEN") {
      return NextResponse.json(
        { error: "Esse usuário já está em uso." },
        { status: 409 },
      );
    }
    if (error instanceof Error && error.message === "USERNAME_RESERVED") {
      return NextResponse.json(
        {
          error:
            "Esse nome é reservado para contas Discord. Escolha outro usuário.",
        },
        { status: 409 },
      );
    }
    console.error("[auth/register]", error);
    return NextResponse.json(
      { error: "Não foi possível criar a conta." },
      { status: 502 },
    );
  }
}
