import Image from "next/image";
import Link from "next/link";
import { CartIcon } from "./icons";

const HERO_IMAGE = "/hero-avatar.webp";

export function Hero() {
  return (
    <section className="site-container relative z-0 mt-[38px] pt-6 pb-8 md:pt-10 md:pb-14 lg:pt-14 lg:pb-16">
      {/* Fumaça roxa esquerda */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[20%] top-[15%] h-[500px] w-[500px] rounded-full bg-[rgba(168,85,247,0.06)] blur-[130px]"
      />

      {/* Grid compartilhado — texto e imagem no mesmo container responsivo */}
      <div className="grid items-center md:grid-cols-[1fr_1.28fr] md:gap-4 lg:gap-8">
        {/* Coluna de texto */}
        <div className="relative z-20 w-full max-w-[540px]">
          <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.75rem]">
            Robux e{" "}
            <span className="whitespace-nowrap">Gamepasses{" "}</span>
            <br />
            <span className="text-[var(--accent)]">sem complicação.</span>
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-relaxed text-[var(--fg-muted)]">
            Entrega rápida, preço justo e suporte de verdade. Sua compra na Hollow
            é simples: escolheu, pagou, recebeu.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
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
          <p className="mt-6 text-sm text-[var(--fg-muted)]">
            Milhares de entregas realizadas · Suporte em português · Sem senha
          </p>
        </div>

        {/* Coluna da imagem desktop — vinculada ao mesmo grid, overflow-visível para preservar tamanho original */}
        <div className="relative z-10 hidden md:block">
          <div className="relative aspect-[2000/1516] w-full overflow-visible">
            <Image
              src={HERO_IMAGE}
              alt="Avatar Hollow com Robux"
              fill
              priority
              sizes="(min-width: 1280px) 920px, 55vw"
              quality={100}
              unoptimized
              className="object-contain object-center"
            />
            {/* Fade sutil de baixo para cima */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent"
            />
          </div>
        </div>
      </div>

      {/* Mobile: imagem dentro do fluxo, abaixo do texto */}
      <div className="relative z-10 mt-10 md:hidden">
        <div className="relative mx-auto aspect-[2000/1516] w-full max-w-[407px] overflow-visible">
          <Image
            src={HERO_IMAGE}
            alt="Avatar Hollow com Robux"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 407px"
            quality={100}
            unoptimized
            className="object-contain object-center"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent"
          />
        </div>
      </div>
    </section>
  );
}