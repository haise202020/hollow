import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { findUserById, updateUserPassword } from "@/lib/auth/users";
import { assertCsrf, CSRF_COOKIE } from "@/lib/security/csrf-core";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";

const bodySchema = z.object({
  currentPassword: z.string().min(8).max(72),
  newPassword: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  const ip = getClientIp(request.headers);
  const limited = rateLimit(`auth-password:${ip}`, 8, 60_000);
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

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return NextResponse.json(
      { error: "A nova senha precisa ser diferente da atual." },
      { status: 400 },
    );
  }

  const user = await findUserById(session.sub);
  if (!user?.passwordHash) {
    return NextResponse.json(
      {
        error:
          "Contas Discord não têm senha. Crie uma conta com usuário e senha para usar essa opção.",
      },
      { status: 400 },
    );
  }

  const ok = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!ok) {
    return NextResponse.json({ error: "Senha atual incorreta." }, { status: 401 });
  }

  try {
    const passwordHash = await hashPassword(parsed.data.newPassword);
    await updateUserPassword(session.sub, passwordHash);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[auth/password]", error);
    return NextResponse.json(
      { error: "Não foi possível atualizar a senha." },
      { status: 502 },
    );
  }
}
