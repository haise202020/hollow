"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  formatBrl,
  ROBUX_MAX,
  ROBUX_MIN,
  ROBUX_STEP,
  robuxToBrl,
} from "@/lib/data/catalog";
import { CartIcon } from "./icons";

const PRESETS = [500, 1000, 2000, 5000, 10000, 25000];

export function RobuxSlider() {
  const [amount, setAmount] = useState(1000);
  const [bump, setBump] = useState(0);

  const price = useMemo(() => robuxToBrl(amount), [amount]);
  const progress = ((amount - ROBUX_MIN) / (ROBUX_MAX - ROBUX_MIN)) * 100;

  useEffect(() => {
    setBump((value) => value + 1);
  }, [amount]);

  function setAmountAnimated(next: number) {
    setAmount(Math.min(ROBUX_MAX, Math.max(ROBUX_MIN, next)));
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="animate-rise overflow-hidden rounded-2xl border-none bg-[#0c0a14]/80 p-6 shadow-[0_0_40px_rgba(0,0,0,0.3)] backdrop-blur-md md:p-8">
        {/* Glass highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent"
        />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div key={`qty-${bump}`} className="animate-value-pop">
            <p className="text-sm text-[var(--fg-muted)]">Quantidade</p>
            <p className="mt-1 font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
              {amount.toLocaleString("pt-BR")}{" "}
              <span className="text-2xl text-[var(--accent-bright)] md:text-3xl">
                Robux
              </span>
            </p>
          </div>

          <div key={`price-${bump}`} className="animate-value-pop text-right">
            <p className="text-sm text-[var(--fg-muted)]">Valor</p>
            <p className="mt-1 font-display text-4xl font-bold tracking-tight text-[var(--accent-bright)] md:text-5xl">
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
                className={`rounded-md border px-3.5 py-1.5 text-sm transition duration-200 ${
                  amount === preset
                    ? "border-[var(--accent)] bg-[var(--accent)]/15 text-white shadow-[0_0_16px_var(--accent-glow)]"
                    : "border-white/10 text-[var(--fg-muted)] hover:border-[var(--accent)]/40 hover:text-white"
                }`}
              >
                {preset.toLocaleString("pt-BR")}
              </button>
            ))}
          </div>
        </div>

        <Link
          href={`/checkout?type=robux&amount=${amount}`}
          className="group mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-lg bg-[var(--accent)] px-4 py-3.5 text-sm font-semibold text-[#08090d] transition-all hover:bg-[var(--accent-bright)] hover:shadow-[0_0_24px_var(--accent-glow)] active:scale-[0.99]"
        >
          <CartIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          Comprar {amount.toLocaleString("pt-BR")} Robux por {formatBrl(price)}
        </Link>
      </div>
    </div>
  );
}
