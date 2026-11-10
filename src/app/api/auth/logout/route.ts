import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSessionCookie, SESSION_COOKIE } from "@/lib/auth/session";
import { revokeSession, tokenToJti } from "@/lib/auth/session-blacklist";

export async function POST() {
  // Ler o token ANTES de limpar o cookie para poder revogá-lo server-side
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      // Decodificar expiração do JWT para saber até quando manter na blacklist
      // O payload está entre os dois pontos: header.payload.signature
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(parts[1], "base64url").toString("utf-8"),
        );
        const expiresAt =
          typeof payload.exp === "number" ? payload.exp * 1000 : Date.now() + 14 * 24 * 60 * 60 * 1000;
        const jti = tokenToJti(token);
        revokeSession(jti, expiresAt);
      }
    } catch {
      // Se não conseguir decodificar, ainda assim limpa o cookie
    }
  }

  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}