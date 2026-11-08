export function isAdminDiscordId(discordId: string | null | undefined): boolean {
  const adminId = process.env.NEXT_PUBLIC_ADMIN_DISCORD_ID?.trim() ?? "";
  return adminId.length > 0 && discordId === adminId;
}
