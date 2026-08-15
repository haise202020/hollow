import { NextResponse } from "next/server";
import { z } from "zod";
import { gamepassPriceForNetRobux, ROBUX_MAX, ROBUX_MIN } from "@/lib/data/catalog";
import { findMatchingGamepass } from "@/lib/roblox/gamepasses";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { sanitizeDigits } from "@/lib/security/sanitize";

const querySchema = z.object({
  userId: z.number().int().positive(),
  robuxAmount: z.number().int().min(ROBUX_MIN).max(ROBUX_MAX),
});

export async function GET(request: Request) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(`roblox-gamepass:${ip}`, 30, 60_000);

  if (!limited.success) {
    return NextResponse.json(
      { error: "Muitas verificações. Aguarde um minuto." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    userId: Number(sanitizeDigits(searchParams.get("userId"), 16)),
    robuxAmount: Number(sanitizeDigits(searchParams.get("robuxAmount"), 8)),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const requiredPrice = gamepassPriceForNetRobux(parsed.data.robuxAmount);

  try {
    const result = await findMatchingGamepass({
      userId: parsed.data.userId,
      requiredPrice,
    });

    return NextResponse.json({
      ok: true,
      requiredPrice,
      found: Boolean(result.matched),
      checked: result.checked,
      gamepass: result.matched,
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível verificar as gamepasses agora." },
      { status: 502 },
    );
  }
}
