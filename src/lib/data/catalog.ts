export type Gamepass = {
  id: string;
  name: string;
  game: string;
  priceBrl: number;
  oldPriceBrl?: number;
  discountLabel?: string;
  badge?: string;
  image: string;
};

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
];

export function formatBrl(value: number): string {
  const amount = Number.isFinite(value) ? value : 0;
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
