"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  formatBrl,
  gamepassPriceForNetRobux,
  ROBUX_MAX,
  ROBUX_MIN,
  ROBUX_PRICE_PER_UNIT,
  ROBUX_STEP,
  robuxToBrl,
} from "@/lib/data/catalog";
import { CartIcon } from "./icons";

const PRESETS = [500, 1000, 2000, 5000, 10000, 25000];
const DETAILS_MASCOT = "https://i.imgur.com/uVxPXOo.png";

export function RobuxSlider() {
  const [amount, setAmount] = useState(1000);
  const [bump, setBump] = useState(0);

  const price = useMemo(() => robuxToBrl(amount), [amount]);
  const gamepassAmount = useMemo(
    () => gamepassPriceForNetRobux(amount),
    [amount],
  );
  const progress = ((amount - ROBUX_MIN) / (ROBUX_MAX - ROBUX_MIN)) * 100;

  useEffect(() => {
    setBump((value) => value + 1);
  }, [amount]);

  function setAmountAnimated(next: number) {
    setAmount(Math.min(ROBUX_MAX, Math.max(ROBUX_MIN, next)));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
      <div className="animate-rise rounded-2xl bg-[#0c0c10] p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div key={`qty-${bump}`} className="animate-value-pop">
            <p className="text-sm text-[var(--fg-muted)]">Quantidade</p>
            <p className="mt-1 font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
              {amount.toLocaleString("pt-BR")}{" "}
              <span className="text-2xl text-[var(--purple-bright)] md:text-3xl">
                Robux
              </span>
            </p>
          </div>

          <div key={`price-${bump}`} className="animate-value-pop text-right">
            <p className="text-sm text-[var(--fg-muted)]">Valor</p>
            <p className="mt-1 font-display text-4xl font-bold tracking-tight text-[var(--purple-bright)] md:text-5xl">
              {formatBrl(price)}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <label htmlFor="robux-range" className="sr-only">
            Escolher quantidade de Robux
          </label>
          <input
            id="robux-range"
            type="range"
            min={ROBUX_MIN}
            max={ROBUX_MAX}
            step={ROBUX_STEP}
            value={amount}
            onChange={(event) => setAmountAnimated(Number(event.target.value))}
            className="robux-range w-full"
            style={{ "--progress": `${progress}%` } as CSSProperties}
          />
          <div className="mt-2 flex justify-between text-xs text-[var(--fg-muted)]">
            <span>{ROBUX_MIN.toLocaleString("pt-BR")}</span>
            <span>{ROBUX_MAX.toLocaleString("pt-BR")}</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {PRESETS.map((preset, index) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmountAnimated(preset)}
                style={{ animationDelay: `${0.05 * index}s` }}
                className={`animate-rise rounded-full border px-3.5 py-1.5 text-sm transition duration-200 ${
                  amount === preset
                    ? "border-[var(--purple)] bg-[var(--purple)]/15 text-white shadow-[0_0_20px_rgba(139,92,246,0.25)]"
                    : "border-white/12 text-[var(--fg-muted)] hover:border-[var(--purple)]/50 hover:text-white"
                }`}
              >
                {preset.toLocaleString("pt-BR")}
              </button>
            ))}
          </div>
        </div>

        <Link
          href={`/checkout?type=robux&amount=${amount}`}
          className="btn-pulse mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--purple)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--purple-bright)] hover:scale-[1.01] active:scale-[0.99]"
        >
          <CartIcon className="h-4 w-4" />
          Comprar {amount.toLocaleString("pt-BR")} Robux por {formatBrl(price)}
        </Link>
      </div>

      <div className="relative mt-16 animate-rise-delay sm:mt-20 lg:mt-0">
        <div className="pointer-events-none absolute -top-[calc(7rem+0.5cm)] left-1/2 z-10 w-[180px] -translate-x-1/2 translate-x-[0.5cm] sm:-top-[calc(8rem+0.5cm)] sm:w-[210px] lg:left-[58%]">
          <Image
            src={DETAILS_MASCOT}
            alt="Mascote Hollow"
            width={520}
            height={520}
            className="h-auto w-full object-contain"
            priority
          />
        </div>

        <aside className="relative z-0 flex flex-col gap-5 rounded-2xl bg-[#0c0c10] p-6 md:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--purple-bright)]">
              Detalhes da compra
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">
              Como funciona
            </h2>
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Taxa de 30% do Roblox já está coberta nesta compra.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
              Você não paga a taxa à parte — ela já entra no valor final.
            </p>
          </div>

          <div key={`gp-${bump}`} className="animate-value-pop">
            <p className="text-sm text-[var(--fg-muted)]">Coloque na gamepass</p>
            <p className="mt-1 font-display text-3xl font-bold text-[var(--purple-bright)]">
              {gamepassAmount.toLocaleString("pt-BR")}{" "}
              <span className="text-lg text-white">Robux</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
              Assim você recebe exatamente{" "}
              <span className="font-semibold text-white">
                {amount.toLocaleString("pt-BR")} Robux
              </span>
              .
            </p>
          </div>

          <div className="mt-auto border-t border-white/[0.06] pt-4">
            <p className="text-sm text-[var(--fg-muted)]">Cotação</p>
            <p className="mt-1 text-base font-medium text-white">
              1.000 Robux = {formatBrl(ROBUX_PRICE_PER_UNIT)}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
