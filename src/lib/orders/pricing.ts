import {
  hotItems,
  ROBUX_MAX,
  ROBUX_MIN,
  ROBUX_STEP,
  robuxToBrl,
} from "@/lib/data/catalog";
import type { OrderType } from "./types";

export type ResolvedCheckoutItem = {
  type: OrderType;
  productLabel: string;
  amountBrl: number;
  robuxAmount?: number;
  gamepassId?: string;
};

/** Always recalculate price on the server — never trust client amounts. */
export function resolveCheckoutItem(input: {
  type: string;
  robuxAmount?: number;
  gamepassId?: string;
}): ResolvedCheckoutItem | null {
  if (input.type === "robux") {
    const amount = Number(input.robuxAmount);
    if (
      !Number.isFinite(amount) ||
      amount < ROBUX_MIN ||
      amount > ROBUX_MAX ||
      amount % ROBUX_STEP !== 0
    ) {
      return null;
    }

    const amountBrl = Math.round(robuxToBrl(amount) * 100) / 100;
    return {
      type: "robux",
      productLabel: `${amount.toLocaleString("pt-BR")} Robux`,
      amountBrl,
      robuxAmount: amount,
    };
  }

  if (input.type === "gamepass") {
    const item = hotItems.find((entry) => entry.id === input.gamepassId);
    if (!item) return null;

    return {
      type: "gamepass",
      productLabel: `${item.name} (${item.game})`,
      amountBrl: item.priceBrl,
      gamepassId: item.id,
    };
  }

  return null;
}
