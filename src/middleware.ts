import { NextRequest, NextResponse } from "next/server";
import {
  createCsrfToken,
  CSRF_COOKIE,
  verifyCsrfToken,
} from "@/lib/security/csrf-core";
import {
  getClientIp,
  pruneRateLimitBuckets,
  rateLimit,
} from "@/lib/security/rate-limit";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const ip = getClientIp(request.headers);

  pruneRateLimitBuckets();
  const globalLimit = rateLimit(`mw:${ip}`, 120, 60_000);
  if (!globalLimit.success) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em instantes." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(1, Math.ceil((globalLimit.resetAt - Date.now()) / 1000)),
          ),
        },
      },
    );
  }

  const existing = request.cookies.get(CSRF_COOKIE)?.value;
  if (!existing || !(await verifyCsrfToken(existing))) {
    const token = await createCsrfToken();
    response.cookies.set({
      name: CSRF_COOKIE,
      value: token,
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  }

  const isWebhook = request.nextUrl.pathname.startsWith("/api/webhooks/");

  if (
    MUTATING.has(request.method) &&
    request.nextUrl.pathname.startsWith("/api/") &&
    !isWebhook
  ) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
      }
    }
  }

  response.headers.set("X-Request-Id", crypto.randomUUID());
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
