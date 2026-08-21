import {
  hotItems,
  ROBUX_MAX,
  ROBUX_MIN,
  ROBUX_STEP,
  robuxToBrl,
} from "@/lib/data/catalog";
import type { OrderType } from "./types";

export const CUSTOM_GAMEPASS_MIN_BRL = 1;
export const CUSTOM_GAMEPASS_MAX_BRL = 5_000;

export type ResolvedCheckoutItem = {
  type: OrderType;
  productLabel: string;
  amountBrl: number;
  robuxAmount?: number;
  gamepassId?: string;
  customGameName?: string;
  customGamepassName?: string;
};

/** Always recalculate price on the server — never trust client amounts. */
export function resolveCheckoutItem(input: {
  type: string;
  robuxAmount?: number;
  gamepassId?: string;
  customGameName?: string;
  customGamepassName?: string;
  customAmountBrl?: number;
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

  if (input.type === "custom_gamepass") {
    const gameName = (input.customGameName ?? "").trim();
    const passName = (input.customGamepassName ?? "").trim();
    const amountBrl = Math.round(Number(input.customAmountBrl) * 100) / 100;

    if (gameName.length < 2 || gameName.length > 80) return null;
    if (passName.length < 2 || passName.length > 80) return null;
    if (
      !Number.isFinite(amountBrl) ||
      amountBrl < CUSTOM_GAMEPASS_MIN_BRL ||
      amountBrl > CUSTOM_GAMEPASS_MAX_BRL
    ) {
      return null;
    }

    return {
      type: "custom_gamepass",
      productLabel: `${passName} (${gameName})`,
      amountBrl,
      customGameName: gameName,
      customGamepassName: passName,
    };
  }

  return null;
}
