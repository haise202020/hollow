import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api/response";
import { assertCsrf, getCsrfCookieFromHeaders } from "@/lib/security/csrf-core";
import { ensureCsrfCookie } from "@/lib/security/csrf";
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

  const cookieToken = getCsrfCookieFromHeaders(request.headers);

  if (!(await assertCsrf(request, cookieToken))) {
    await ensureCsrfCookie();
    return apiError("Token CSRF expirado. Tente novamente.", 419);
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
    return apiError("Dados inválidos.", 400, {
      details: parsed.error.flatten(),
    });
  }

  // Structured log so messages are actually captured (no silent discard).
  console.log(
    JSON.stringify({
      event: "contact_form",
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message.slice(0, 200),
      ip,
      ts: new Date().toISOString(),
    }),
  );

  return NextResponse.json({
    ok: true,
    message: "Mensagem recebida com sucesso. Em breve entraremos em contato.",
  });
}
