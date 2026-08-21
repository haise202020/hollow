export type CatalogCategory = "permanent" | "gamepass";

export type Gamepass = {
  id: string;
  name: string;
  game: string;
  /** permanent = frutas permanentes; gamepass = gamepasses do jogo */
  category?: CatalogCategory;
  priceBrl: number;
  oldPriceBrl?: number;
  discountLabel?: string;
  badge?: string;
  image: string;
};

export function itemCategory(item: Gamepass): CatalogCategory {
  return item.category ?? "permanent";
}

export function catalogByCategory(category: CatalogCategory): Gamepass[] {
  return hotItems.filter((item) => itemCategory(item) === category);
}

/** Base: 1000 Robux = R$ 38 */
export const ROBUX_PER_BRL_UNIT = 1000;
export const ROBUX_PRICE_PER_UNIT = 38;
export const ROBUX_MIN = 100;
export const ROBUX_MAX = 50_000;
export const ROBUX_STEP = 100;

export function robuxToBrl(amount: number): number {
  return (amount / ROBUX_PER_BRL_UNIT) * ROBUX_PRICE_PER_UNIT;
}

/** Roblox retém 30% — o preço da gamepass precisa cobrir isso. */
export const ROBLOX_TAX_RATE = 0.3;

export function gamepassPriceForNetRobux(netAmount: number): number {
  return Math.ceil(netAmount / (1 - ROBLOX_TAX_RATE));
}

export const hotItems: Gamepass[] = [
  {
    id: "gp-dragon",
    name: "Dragon Permanente",
    game: "Blox Fruits",
    priceBrl: 209.9,
    oldPriceBrl: 350,
    discountLabel: "40% OFF",
    image: "/photos/17.png",
  },
  {
    id: "gp-kitsune",
    name: "Kitsune Permanente",
    game: "Blox Fruits",
    priceBrl: 174.9,
    oldPriceBrl: 300,
    discountLabel: "42% OFF",
    image: "/photos/18.png",
  },
  {
    id: "gp-control",
    name: "Control Permanente",
    game: "Blox Fruits",
    priceBrl: 174.9,
    oldPriceBrl: 300,
    discountLabel: "42% OFF",
    image: "/photos/19.png",
  },
  {
    id: "gp-yeti",
    name: "Yeti Permanente",
    game: "Blox Fruits",
    priceBrl: 149.9,
    oldPriceBrl: 200,
    discountLabel: "25% OFF",
    image: "/photos/20.png",
  },
  {
    id: "gp-tiger",
    name: "Tiger Permanente",
    game: "Blox Fruits",
    priceBrl: 149.9,
    image: "/photos/25.png",
  },
  {
    id: "gp-spirit",
    name: "Spirit Permanente",
    game: "Blox Fruits",
    priceBrl: 127.49,
    image: "/photos/26.png",
  },
  {
    id: "gp-gas",
    name: "Gas Permanente",
    game: "Blox Fruits",
    priceBrl: 124.99,
    image: "/photos/27.png",
  },
  {
    id: "gp-venom",
    name: "Venom Permanente",
    game: "Blox Fruits",
    priceBrl: 122.49,
    image: "/photos/28.png",
  },
  {
    id: "gp-shadow",
    name: "Shadow Permanente",
    game: "Blox Fruits",
    priceBrl: 121.24,
    image: "/photos/29.png",
  },
  {
    id: "gp-dough",
    name: "Dough Permanente",
    game: "Blox Fruits",
    priceBrl: 119.9,
    image: "/photos/30.png",
  },
  {
    id: "gp-trex",
    name: "T-rex Permanente",
    game: "Blox Fruits",
    priceBrl: 117.5,
    image: "/photos/31.png",
  },
  {
    id: "gp-mamute",
    name: "Mamute Permanente",
    game: "Blox Fruits",
    priceBrl: 117.5,
    image: "/photos/32.png",
  },
  {
    id: "gp-gravity",
    name: "Gravity Permanente",
    game: "Blox Fruits",
    priceBrl: 115,
    image: "/photos/33.png",
  },
  {
    id: "gp-blizzard",
    name: "Blizzard Permanente",
    game: "Blox Fruits",
    priceBrl: 112.5,
    image: "/photos/34.png",
  },
  {
    id: "gp-pain",
    name: "Pain Permanente",
    game: "Blox Fruits",
    priceBrl: 110,
    image: "/photos/35.png",
  },
  {
    id: "gp-rumble",
    name: "Rumble Permanente",
    game: "Blox Fruits",
    priceBrl: 105,
    image: "/photos/36.png",
  },
  {
    id: "gp-portal",
    name: "Portal Permanente",
    game: "Blox Fruits",
    priceBrl: 100,
    image: "/photos/37.png",
  },
  {
    id: "gp-phoenix",
    name: "Phoenix Permanente",
    game: "Blox Fruits",
    priceBrl: 100,
    image: "/photos/38.png",
  },
  {
    id: "gp-sound",
    name: "Sound Permanente",
    game: "Blox Fruits",
    priceBrl: 95,
    image: "/photos/39.png",
  },
  {
    id: "gp-spider",
    name: "Spider Permanente",
    game: "Blox Fruits",
    priceBrl: 90,
    image: "/photos/40.png",
  },
  {
    id: "gp-creation",
    name: "Creation Permanente",
    game: "Blox Fruits",
    priceBrl: 87.5,
    image: "/photos/41.png",
  },
  {
    id: "gp-love",
    name: "Love Permanente",
    game: "Blox Fruits",
    priceBrl: 85,
    image: "/photos/42.png",
  },
  {
    id: "gp-buddha",
    name: "Buddha Permanente",
    game: "Blox Fruits",
    priceBrl: 82.5,
    image: "/photos/43.png",
  },
  {
    id: "gp-terremoto",
    name: "Terremoto Permanente",
    game: "Blox Fruits",
    priceBrl: 75,
    image: "/photos/44.png",
  },
  {
    id: "gp-magma",
    name: "Magma Permanente",
    game: "Blox Fruits",
    priceBrl: 65,
    image: "/photos/45.png",
  },
  {
    id: "gp-ghost",
    name: "Ghost Permanente",
    game: "Blox Fruits",
    priceBrl: 63.75,
    image: "/photos/46.png",
  },
  {
    id: "gp-rubber",
    name: "Rubber Permanente",
    game: "Blox Fruits",
    priceBrl: 60,
    image: "/photos/47.png",
  },
  {
    id: "gp-light",
    name: "Light Permanente",
    game: "Blox Fruits",
    priceBrl: 55,
    image: "/photos/48.png",
  },
  {
    id: "gp-diamond",
    name: "Diamond Permanente",
    game: "Blox Fruits",
    priceBrl: 50,
    image: "/photos/49.png",
  },
  {
    id: "gp-falcon",
    name: "Falcon Permanente",
    game: "Blox Fruits",
    priceBrl: 48.75,
    image: "/photos/50.png",
  },
  {
    id: "gp-escuridao",
    name: "Escuridão Permanente",
    game: "Blox Fruits",
    priceBrl: 47.5,
    image: "/photos/51.png",
  },
  {
    id: "gp-areia",
    name: "Areia Permanente",
    game: "Blox Fruits",
    priceBrl: 42.5,
    image: "/photos/52.png",
  },
  {
    id: "gp-ice",
    name: "Ice Permanente",
    game: "Blox Fruits",
    priceBrl: 37.5,
    image: "/photos/53.png",
  },
  {
    id: "gp-flame",
    name: "Flame Permanente",
    game: "Blox Fruits",
    priceBrl: 27.5,
    image: "/photos/54.png",
  },
  {
    id: "gp-fruit-notifier",
    name: "Notificador de Frutas",
    game: "Blox Fruits",
    category: "gamepass",
    priceBrl: 134.99,
    image: "/photos/55.png",
  },
  {
    id: "gp-dark-blade",
    name: "Dark Blade",
    game: "Blox Fruits",
    category: "gamepass",
    priceBrl: 54,
    image: "/photos/56.png",
  },
  {
    id: "gp-chest-space",
    name: "+1 Espaço no Baú",
    game: "Blox Fruits",
    category: "gamepass",
    priceBrl: 20,
    image: "/photos/57.png",
  },
];

export function formatBrl(value: number): string {
  const amount = Number.isFinite(value) ? value : 0;
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function getGamepassById(id: string): Gamepass | undefined {
  return hotItems.find((item) => item.id === id);
}

export function similarGamepasses(id: string, limit = 5): Gamepass[] {
  const current = getGamepassById(id);
  if (!current) return [];
  const category = itemCategory(current);
  return hotItems
    .filter((item) => item.id !== id && itemCategory(item) === category)
    .slice(0, limit);
}
