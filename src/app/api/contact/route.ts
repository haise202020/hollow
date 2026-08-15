import { NextResponse } from "next/server";
import { z } from "zod";
import { assertCsrf, CSRF_COOKIE } from "@/lib/security/csrf-core";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";

const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  message: z.string().min(10).max(1000),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(`contact:${ip}`, 5, 60_000);

  if (!limited.success) {
    return NextResponse.json(
      { error: "Limite de envios atingido. Aguarde um minuto." },
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

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const candidate = {
    name: sanitizeText(raw.name, 80),
    email: sanitizeText(raw.email, 120).toLowerCase(),
    message: sanitizeText(raw.message, 1000),
  };

  const parsed = contactSchema.safeParse(candidate);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Mensagem recebida com sucesso. Em breve entraremos em contato.",
  });
}
