export type AuthUser = {
  id: string;
  username: string;
  displayName: string;
  email?: string | null;
  discordId?: string | null;
  discordUsername?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserDocument = Omit<AuthUser, "displayName"> & {
  passwordHash?: string | null;
};

/** Contas Discord usam username interno único: dc{snowflake} */
export function discordAccountUsername(discordId: string): string {
  return `dc${discordId}`;
}

/** Bloqueia usernames que colidiriam com contas Discord internas. */
export function isReservedUsername(username: string): boolean {
  const value = username.toLowerCase();
  if (value.startsWith("discord_")) return true;
  if (/^dc\d{5,}$/.test(value)) return true;
  return false;
}

export function resolveDisplayName(user: {
  username: string;
  discordUsername?: string | null;
  discordId?: string | null;
}): string {
  if (user.discordUsername?.trim()) return user.discordUsername.trim();
  if (user.discordId && user.username === discordAccountUsername(user.discordId)) {
    return `discord_${user.discordId.slice(-4)}`;
  }
  return user.username;
}
