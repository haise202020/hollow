export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function getDiscordOAuthConfig() {
  const clientId =
    process.env.DISCORD_CLIENT_ID?.trim() ||
    process.env.DISCORD_APPLICATION_ID?.trim() ||
    "";
  const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim() || "";
  const redirectUri =
    process.env.DISCORD_REDIRECT_URI?.trim() ||
    `${getSiteUrl()}/api/auth/discord/callback`;

  return { clientId, clientSecret, redirectUri };
}

export function discordAuthorizeUrl(state: string): string {
  const { clientId, redirectUri } = getDiscordOAuthConfig();
  const url = new URL("https://discord.com/api/oauth2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify email");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "consent");
  return url.toString();
}
