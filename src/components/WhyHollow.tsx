import Link from "next/link";
import { LockIcon, ShieldIcon } from "./icons";

const benefits = [
  {
    title: "Melhor preço do Brasil",
    description:
      "Cotação competitiva: 1.000 Robux por R$ 38,00. Você vê o valor antes de confirmar.",
  },
  {
    title: "Taxa de 30% coberta",
    description:
      "Na compra de Robux, a taxa do Roblox já entra no cálculo. Mostramos quanto colocar na gamepass.",
  },
  {
    title: "Entrega de gamepasses",
    description:
      "Pedidos de VIP, packs e desbloqueios dos jogos mais jogados, com acompanhamento do pedido.",
  },
  {
    title: "Compra protegida",
    description:
      "Nunca pedimos a senha da sua conta Roblox. Suporte humano e processo com proteção anti-abuso.",
  },
];

export function WhyHollow() {
  return (
    <section className="border-y border-white/5 bg-[#0c0c12]">
      <div className="site-container py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--purple-bright)]">
              Por que a Hollow
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
              Feita para quem quer Robux barato sem dor de cabeça
            </h2>
            <p className="mt-4 text-[var(--fg-muted)]">
              A Hollow une preço baixo, transparência na taxa e entrega segura —
              com foco total no público brasileiro.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-[var(--fg-muted)]">
                <ShieldIcon className="h-3.5 w-3.5 text-[var(--purple-bright)]" />
                Segurança em primeiro lugar
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-[var(--fg-muted)]">
                <LockIcon className="h-3.5 w-3.5 text-[var(--purple-bright)]" />
                Sem pedir senha Roblox
              </span>
            </div>

            <Link
              href="/suporte"
              className="mt-8 inline-flex text-sm font-semibold text-[var(--purple-bright)] transition hover:text-white"
            >
              Falar com o suporte →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-2xl border border-white/10 bg-[#07070a] p-5"
              >
                <h3 className="font-display text-lg font-bold text-white">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
