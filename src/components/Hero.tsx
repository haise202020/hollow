import Image from "next/image";
import Link from "next/link";
import { CartIcon } from "./icons";

const HERO_IMAGE = "/hero-avatar.webp";

export function Hero() {
  return (
    <section className="site-container relative z-0 mt-[38px] pt-8 pb-12 md:pt-12 md:pb-20 lg:pt-16 lg:pb-24">
      {/* Camada de texto — ocupa a largura natural do container */}
      <div className="relative z-20 max-w-xl">
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

      {/* Camada independente da imagem — flutua à direita sem comprimir o texto */}
      <div
        aria-hidden={false}
        className="pointer-events-none absolute right-0 top-1/2 z-10 hidden w-[43vw] max-w-[860px] -translate-y-1/2 md:block md:mr-[140px]"
        style={{ right: "min(0px, calc((100vw - 1180px) / -2))" }}
      >
        <div className="pointer-events-auto relative aspect-[2000/1516] w-full overflow-visible">
          <Image
            src={HERO_IMAGE}
            alt="Avatar Hollow com Robux"
            fill
            priority
            sizes="(min-width: 1280px) 1100px, 55vw"
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