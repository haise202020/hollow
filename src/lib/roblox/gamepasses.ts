export type DetectedGamepass = {
  id: number;
  name: string;
  price: number;
  universeId: number | null;
  imageUrl?: string | null;
};

type UserGame = {
  id: number;
  name?: string;
  rootPlace?: { id: number };
};

async function fetchUserUniverses(userId: number): Promise<number[]> {
  const universeIds = new Set<number>();
  let cursor = "";

  for (let page = 0; page < 3; page += 1) {
    const url = new URL(`https://games.roblox.com/v2/users/${userId}/games`);
    url.searchParams.set("accessFilter", "2");
    url.searchParams.set("limit", "50");
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) break;

    const payload = (await response.json()) as {
      data?: UserGame[];
      nextPageCursor?: string | null;
    };

    for (const game of payload.data ?? []) {
      if (Number.isFinite(game.id)) universeIds.add(game.id);
    }

    if (!payload.nextPageCursor) break;
    cursor = payload.nextPageCursor;
  }

  return [...universeIds];
}

async function fetchUniverseGamepasses(
  universeId: number,
): Promise<DetectedGamepass[]> {
  const found: DetectedGamepass[] = [];
  let pageToken = "";

  for (let page = 0; page < 4; page += 1) {
    const url = new URL(
      `https://apis.roblox.com/game-passes/v1/universes/${universeId}/game-passes`,
    );
    url.searchParams.set("passView", "Full");
    url.searchParams.set("pageSize", "100");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) break;

    const payload = (await response.json()) as {
      gamePasses?: Array<{
        id?: number;
        gamePassId?: number;
        name?: string;
        displayName?: string;
        price?: number | null;
      }>;
      nextPageToken?: string | null;
    };

    for (const pass of payload.gamePasses ?? []) {
      const id = Number(pass.id ?? pass.gamePassId);
      const price = Number(pass.price);
      if (!Number.isFinite(id) || !Number.isFinite(price)) continue;

      found.push({
        id,
        name: pass.displayName || pass.name || `Gamepass ${id}`,
        price,
        universeId,
      });
    }

    if (!payload.nextPageToken) break;
    pageToken = payload.nextPageToken;
  }

  return found;
}

async function fetchCatalogCreatorPasses(
  userId: number,
): Promise<DetectedGamepass[]> {
  const url = new URL("https://catalog.roblox.com/v1/search/items");
  url.searchParams.set("category", "GamePasses");
  url.searchParams.set("creatorTargetId", String(userId));
  url.searchParams.set("creatorType", "User");
  url.searchParams.set("limit", "50");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) return [];

  const payload = (await response.json()) as {
    data?: Array<{ id: number }>;
  };

  const ids = (payload.data ?? [])
    .map((item) => item.id)
    .filter((id) => Number.isFinite(id));

  if (ids.length === 0) return [];

  const detailsRes = await fetch(
    "https://catalog.roblox.com/v1/catalog/items/details",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: ids.map((id) => ({ itemType: "GamePass", id })),
      }),
      cache: "no-store",
    },
  );

  if (!detailsRes.ok) return [];

  const details = (await detailsRes.json()) as {
    data?: Array<{
      id: number;
      name?: string;
      price?: number | null;
      lowestPrice?: number | null;
    }>;
  };

  return (details.data ?? []).flatMap((item) => {
    const price = Number(item.price ?? item.lowestPrice);
    if (!Number.isFinite(price)) return [];
    return [
      {
        id: item.id,
        name: item.name || `Gamepass ${item.id}`,
        price,
        universeId: null as number | null,
      },
    ];
  });
}

export async function fetchGamepassImage(gamePassId: number): Promise<string | null> {
  try {
    const url = new URL("https://thumbnails.roblox.com/v1/game-passes");
    url.searchParams.set("gamePassIds", String(gamePassId));
    url.searchParams.set("size", "150x150");
    url.searchParams.set("format", "Png");
    url.searchParams.set("isCircular", "false");

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as {
      data?: Array<{ imageUrl?: string; state?: string }>;
    };
    return payload.data?.[0]?.imageUrl ?? null;
  } catch {
    return null;
  }
}

export async function findMatchingGamepass(input: {
  userId: number;
  requiredPrice: number;
}): Promise<{
  matched: DetectedGamepass | null;
  checked: number;
}> {
  const collected = new Map<number, DetectedGamepass>();

  try {
    const catalogPasses = await fetchCatalogCreatorPasses(input.userId);
    for (const pass of catalogPasses) collected.set(pass.id, pass);
  } catch {
    // Continue with universe scan.
  }

  try {
    const universes = await fetchUserUniverses(input.userId);
    const limited = universes.slice(0, 12);
    const batches = await Promise.all(
      limited.map((universeId) => fetchUniverseGamepasses(universeId)),
    );
    for (const batch of batches) {
      for (const pass of batch) collected.set(pass.id, pass);
    }
  } catch {
    // Keep whatever we already collected.
  }

  const all = [...collected.values()];
  const matched =
    all.find((pass) => pass.price === input.requiredPrice) ?? null;

  if (!matched) {
    return { matched: null, checked: all.length };
  }

  const imageUrl = await fetchGamepassImage(matched.id);
  return {
    matched: { ...matched, imageUrl },
    checked: all.length,
  };
}
