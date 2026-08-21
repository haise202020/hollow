"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatBrl } from "@/lib/data/catalog";
import {
  CUSTOM_GAMEPASS_MAX_BRL,
  CUSTOM_GAMEPASS_MIN_BRL,
} from "@/lib/orders/pricing";
import { BasketIcon } from "@/components/icons";

function parseMoney(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, "").replace("R$", "").replace(",", ".");
  if (!cleaned) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100) / 100;
}

export function CustomGamepassForm() {
  const router = useRouter();
  const [gameName, setGameName] = useState("");
  const [passName, setPassName] = useState("");
  const [priceRaw, setPriceRaw] = useState("");
  const [error, setError] = useState("");

  const amountBrl = useMemo(() => parseMoney(priceRaw), [priceRaw]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const game = gameName.trim();
    const pass = passName.trim();

    if (game.length < 2 || game.length > 80) {
      setError("Informe o nome do jogo (2 a 80 caracteres).");
      return;
    }
    if (pass.length < 2 || pass.length > 80) {
      setError("Informe o nome da gamepass (2 a 80 caracteres).");
      return;
    }
    if (
      amountBrl == null ||
      amountBrl < CUSTOM_GAMEPASS_MIN_BRL ||
      amountBrl > CUSTOM_GAMEPASS_MAX_BRL
    ) {
      setError(
        `Valor inválido. Use entre ${formatBrl(CUSTOM_GAMEPASS_MIN_BRL)} e ${formatBrl(CUSTOM_GAMEPASS_MAX_BRL)}.`,
      );
      return;
    }

    const params = new URLSearchParams({
      type: "custom_gamepass",
      game,
      name: pass,
      amount: String(amountBrl),
    });
    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-xl rounded-3xl border-2 border-[#2a2a32] bg-[#121218]/90 p-5 shadow-[0_0_50px_rgba(139,92,246,0.12)] md:p-8"
    >
      <div className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-white">Nome do jogo</span>
          <input
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="Ex: Blox Fruits, Adopt Me..."
            maxLength={80}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[var(--fg-muted)] focus:border-[var(--purple)]"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-white">Nome da gamepass</span>
          <input
            value={passName}
            onChange={(e) => setPassName(e.target.value)}
            placeholder="Ex: 2x Money, VIP Pass..."
            maxLength={80}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[var(--fg-muted)] focus:border-[var(--purple)]"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-white">
            Valor da gamepass (R$)
          </span>
          <input
            value={priceRaw}
            onChange={(e) => setPriceRaw(e.target.value)}
            inputMode="decimal"
            placeholder="Ex: 49,90"
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[var(--fg-muted)] focus:border-[var(--purple)]"
          />
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--purple)]/30 bg-[var(--purple)]/10 px-4 py-4">
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--purple-bright)]">
          Valor do pedido
        </p>
        <p className="mt-1 font-display text-3xl font-bold text-white">
          {amountBrl != null && amountBrl > 0
            ? formatBrl(amountBrl)
            : "R$ 0,00"}
        </p>
        <p className="mt-1 text-xs text-[var(--fg-muted)]">
          Pagamento via Pix com confirmação automática (MisticPay).
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--purple)] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--purple-bright)]"
      >
        <BasketIcon className="h-4 w-4" />
        Continuar para o Pix
      </button>
    </form>
  );
}
