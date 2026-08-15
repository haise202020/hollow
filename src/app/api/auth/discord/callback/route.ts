import { NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE,
} from "@/lib/auth/session";
import { getDiscordOAuthConfig, getSiteUrl } from "@/lib/auth/discord-oauth";
import { upsertDiscordUser } from "@/lib/auth/users";

type DiscordTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type DiscordUserResponse = {
  id: string;
  username: string;
  global_name?: string | null;
  email?: string | null;
  avatar?: string | null;
};

export async function GET(request: Request) {
  const siteUrl = getSiteUrl();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(`${siteUrl}/login?error=discord_denied`);
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const expectedState = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("hollow_oauth_state="))
    ?.split("=")[1];

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${siteUrl}/login?error=discord_state`);
  }

  const { clientId, clientSecret, redirectUri } = getDiscordOAuthConfig();
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${siteUrl}/login?error=discord_config`);
  }

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
      cache: "no-store",
    });

    const tokenJson = (await tokenRes.json()) as DiscordTokenResponse;
    if (!tokenRes.ok || !tokenJson.access_token) {
      console.error("[discord-oauth] token error", tokenJson);
      return NextResponse.redirect(`${siteUrl}/login?error=discord_token`);
    }

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      cache: "no-store",
    });
    const discordUser = (await userRes.json()) as DiscordUserResponse;
    if (!userRes.ok || !discordUser.id) {
      return NextResponse.redirect(`${siteUrl}/login?error=discord_user`);
    }

    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=128`
      : null;

    const user = await upsertDiscordUser({
      discordId: discordUser.id,
      discordUsername: discordUser.global_name || discordUser.username,
      email: discordUser.email ?? null,
      avatarUrl,
    });

    const sessionToken = await createSessionToken(user);
    const response = NextResponse.redirect(`${siteUrl}/`);
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 14 * 24 * 60 * 60,
    });
    response.cookies.set("hollow_oauth_state", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error("[discord-oauth] callback", error);
    return NextResponse.redirect(`${siteUrl}/login?error=discord_callback`);
  }
}
