"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatBrl, hotItems } from "@/lib/data/catalog";

/* ─── Itens que alternam no card direito ─── */
const SHOWCASE_ITEMS = [
  ...hotItems.filter((i) => i.category === "gamepass"),
  ...hotItems.filter((i) => !i.category).slice(0, 5),
];

export function GamepassesSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const currentItem = SHOWCASE_ITEMS[activeIndex];

  return (
    <section className="relative overflow-hidden bg-[var(--bg)]">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-[20%] h-[500px] w-[500px] rounded-full bg-[rgba(168,85,247,0.07)] blur-[140px]"
      />

      <div className="site-container relative py-20 md:py-28 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: Text content — textos maiores */}
          <div className="max-w-xl">
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-bright)] md:text-sm">
              Gamepasses exclusivas
            </span>

            <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-[3.25rem]">
              Desbloqueie poderes{" "}
              <span className="text-[var(--accent)]">dentro do jogo.</span>
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-[var(--fg-muted)] md:text-xl">
              A Hollow entrega gamepasses da maioria dos jogos do Roblox —
              não apenas Blox Fruits. Não encontrou o que procura? Monte um
              pedido personalizado com o nome do jogo, da gamepass e o valor,
              e pague via Pix na hora. Tudo com entrega automática e preço
              justo.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-4">
              {[
                "Entrega instantânea após confirmação do PIX",
                "Gamepasses de qualquer jogo do Roblox",
                "Pedidos personalizados sob demanda",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3.5">
                  <svg
                    className="mt-1 h-6 w-6 shrink-0 text-[var(--accent)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-base text-white/90 md:text-lg">{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/gamepasses"
              className="group mt-10 inline-flex items-center gap-2.5 rounded-xl bg-[var(--accent)] px-7 py-4 text-base font-semibold text-white shadow-[0_0_20px_var(--accent-glow)] transition-all hover:bg-[var(--accent-bright)] hover:shadow-[0_0_32px_var(--accent-glow)]"
            >
              Explorar gamepasses
              <svg
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>

          {/* Right: Carousel showcase */}
          <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
            {/* Glow behind image */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 scale-90 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.12),transparent_70%)] blur-2xl"
            />

            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              {/* Animated image container */}
              <div className="relative aspect-[3/2] w-full">
                {SHOWCASE_ITEMS.map((item, index) => (
                  <div
                    key={item.id}
                    className={`absolute inset-0 flex items-center justify-center bg-[#0d0d12] p-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      index === activeIndex
                        ? "scale-100 opacity-100"
                        : "scale-95 opacity-0"
                    }`}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={400}
                      height={400}
                      className="max-h-full max-w-full object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                      sizes="(max-width: 1024px) 80vw, 400px"
                    />
                  </div>
                ))}
              </div>

              {/* Overlay gradient at bottom */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg-elevated)] to-transparent"
              />

              {/* Floating info badge — updates with carousel */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-black/60 px-5 py-3.5 backdrop-blur-md transition-all duration-500">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                    {currentItem.category === "gamepass" ? "Gamepass" : "Fruta Permanente"}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-white md:text-base">
                    {currentItem.name}
                  </p>
                </div>
                <span className="rounded-lg bg-[var(--accent)]/20 px-3 py-1.5 text-xs font-bold text-[var(--accent-bright)] md:text-sm">
                  {formatBrl(currentItem.priceBrl)}
                </span>
              </div>

              {/* Progress dots */}
              <div className="absolute top-4 right-4 flex gap-1.5">
                {SHOWCASE_ITEMS.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === activeIndex
                        ? "w-6 bg-[var(--accent)]"
                        : "w-1.5 bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}