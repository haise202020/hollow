import { NextResponse } from "next/server";
import {
  discordAuthorizeUrl,
  getDiscordOAuthConfig,
} from "@/lib/auth/discord-oauth";

export async function GET() {
  const { clientId, clientSecret } = getDiscordOAuthConfig();
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error:
          "Discord OAuth não configurado. Defina DISCORD_CLIENT_ID e DISCORD_CLIENT_SECRET.",
      },
      { status: 503 },
    );
  }

  const state = crypto.randomUUID().replace(/-/g, "");
  const response = NextResponse.redirect(discordAuthorizeUrl(state));
  response.cookies.set("hollow_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}
