import { NextResponse } from "next/server";
import { lookupRobloxUser } from "@/lib/roblox/lookup";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { sanitizeUsername } from "@/lib/security/sanitize";

export async function GET(request: Request) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(`roblox-lookup:${ip}`, 20, 60_000);

  if (!limited.success) {
    return NextResponse.json(
      { error: "Muitas buscas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const username = sanitizeUsername(searchParams.get("username") ?? "");

  if (username.length < 3) {
    return NextResponse.json(
      { error: "Digite um usuário válido do Roblox." },
      { status: 400 },
    );
  }

  try {
    const profile = await lookupRobloxUser(username);
    if (!profile) {
      return NextResponse.json(
        { error: "Usuário não encontrado no Roblox." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Falha ao consultar o Roblox.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
