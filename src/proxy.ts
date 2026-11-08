import { NextRequest, NextResponse } from "next/server";

const CSRF_COOKIE = "hollow_csrf";

function getCsrfSecret(): string {
  const secret = process.env.CSRF_SECRET;
  if (secret && secret.length >= 32) return secret;
  return "hollow-dev-csrf-secret-change-me-32chars";
}

function toHex(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(view)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Gera token CSRF compatível com csrf-core.ts (HMAC-SHA256 + CSRF_SECRET).
 * Usa apenas APIs disponíveis no Edge Runtime do Next.js middleware.
 */
async function generateCsrfToken(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const token = toHex(bytes);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getCsrfSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(token));

  return `${token}.${toHex(signature)}`;
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Adicionar header de request ID para debugging
  response.headers.set("X-Request-Id", crypto.randomUUID());

  // Garantir que o cookie CSRF exista em TODAS as requisições (incluindo GET /login)
  const existingCookie = request.cookies.get(CSRF_COOKIE)?.value;
  if (!existingCookie) {
    const token = await generateCsrfToken();
    response.cookies.set(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, jpeg, gif, webp, ico)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
