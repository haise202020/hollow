export type RobloxProfile = {
  id: number;
  name: string;
  displayName: string;
  description: string;
  hasVerifiedBadge: boolean;
  avatarUrl: string | null;
  createdAt: string | null;
};

export async function lookupRobloxUser(
  username: string,
): Promise<RobloxProfile | null> {
  const usernamesRes = await fetch("https://users.roblox.com/v1/usernames/users", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      usernames: [username],
      excludeBannedUsers: true,
    }),
    cache: "no-store",
  });

  if (!usernamesRes.ok) {
    throw new Error("Não foi possível consultar o Roblox agora.");
  }

  const usernamesPayload = (await usernamesRes.json()) as {
    data?: Array<{ id: number; name: string; requestedUsername: string }>;
  };

  const match = usernamesPayload.data?.[0];
  if (!match?.id) return null;

  const [userRes, thumbRes] = await Promise.all([
    fetch(`https://users.roblox.com/v1/users/${match.id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    }),
    fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${match.id}&size=420x420&format=Png&isCircular=false`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    ),
  ]);

  if (!userRes.ok) {
    throw new Error("Não foi possível carregar o perfil do Roblox.");
  }

  const user = (await userRes.json()) as {
    id: number;
    name: string;
    displayName: string;
    description?: string;
    hasVerifiedBadge?: boolean;
    created?: string;
  };

  let avatarUrl: string | null = null;
  if (thumbRes.ok) {
    const thumbs = (await thumbRes.json()) as {
      data?: Array<{ imageUrl?: string; state?: string }>;
    };
    const imageUrl = thumbs.data?.[0]?.imageUrl;
    if (imageUrl) avatarUrl = imageUrl;
  }

  return {
    id: user.id,
    name: user.name,
    displayName: user.displayName || user.name,
    description: (user.description ?? "").trim(),
    hasVerifiedBadge: Boolean(user.hasVerifiedBadge),
    avatarUrl,
    createdAt: user.created ?? null,
  };
}

/** Gateway-only placeholder fields (MisticPay still requires name + CPF). */
export function gatewayPayerFromUsername(username: string): {
  payerName: string;
  payerDocument: string;
} {
  const seed = [...username.toLowerCase()].reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0,
    7,
  );

  const base = String(seed).padStart(9, "0").slice(0, 9).split("").map(Number);

  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += base[i]! * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;

  sum = 0;
  for (let i = 0; i < 9; i += 1) sum += base[i]! * (11 - i);
  sum += d1 * 2;
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;

  return {
    payerName: `Roblox ${username}`.slice(0, 80),
    payerDocument: `${base.join("")}${d1}${d2}`,
  };
}
