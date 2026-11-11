import Image from "next/image";
import Link from "next/link";
import { CartIcon } from "./icons";

const HERO_IMAGE = "/hero-avatar.webp";

export function Hero() {
  return (
    <section className="site-container relative z-0 grid items-center gap-10 pt-8 pb-12 md:grid-cols-2 md:gap-8 md:pt-12 md:pb-20 lg:pt-16 lg:pb-24">
      {/* Ambient glow — subtle, not overwhelming */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-[500px] w-[500px] rounded-full opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-20">
        <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.75rem]">
          Robux e Gamepasses{" "}
          <span className="text-[var(--accent)]">sem complicação.</span>
        </h1>

        <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--fg-muted)]">
          Entrega rápida, preço justo e suporte de verdade. Sua compra na Hollow
          é simples: escolheu, pagou, recebeu.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/robux"
            className="group inline-flex items-center gap-2.5 rounded-lg bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[#08090d] transition-all hover:bg-[var(--accent-bright)] hover:shadow-[0_0_24px_var(--accent-glow)]"
          >
            <CartIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            Comprar Robux
          </Link>
          <Link
            href="/gamepasses"
            className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[var(--accent)]/50 hover:bg-white/[0.06]"
          >
            Ver gamepasses
          </Link>
        </div>

        {/* Social proof line — earns trust without shouting */}
        <p className="mt-8 text-sm text-[var(--fg-muted)]">
          Milhares de entregas realizadas · Suporte em português · Sem senha
        </p>
      </div>

      <div className="relative z-10 mx-auto min-w-0 w-full max-w-[640px]">
        <div className="relative aspect-[1359/1158] overflow-hidden">
          <Image
            src={HERO_IMAGE}
            alt="Avatar Hollow com Robux"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-contain object-center"
          />
          {/* Fade sutil de baixo para cima */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent"
          />
        </div>
      </div>
    </section>
  );
}