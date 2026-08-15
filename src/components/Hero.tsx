import Image from "next/image";
import Link from "next/link";
import { CartIcon } from "./icons";

const HERO_IMAGE = "https://i.imgur.com/myqa092.png";

export function Hero() {
  return (
    <section className="site-container grid items-center gap-10 py-10 md:grid-cols-2 md:gap-8 md:py-16 lg:py-20">
      <div className="animate-rise">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--purple-bright)]">
          Melhor preço do Brasil
        </p>

        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
          Compre{" "}
          <span className="text-[var(--purple-bright)]">Robux</span> e{" "}
          <span className="text-[var(--purple-bright)]">Gamepasses</span> com
          entrega segura.
        </h1>

        <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--fg-muted)] md:text-lg">
          A Hollow entrega Robux barato e gamepasses dos seus jogos favoritos no
          Roblox — rápido, seguro e com suporte humano.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/robux"
            className="btn-pulse inline-flex items-center gap-2 rounded-xl bg-[var(--purple)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--purple-bright)]"
          >
            <CartIcon className="h-4 w-4" />
            Comprar agora
          </Link>
          <Link
            href="/gamepasses"
            className="inline-flex items-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-[var(--purple)] hover:text-[var(--purple-bright)]"
          >
            Ver gamepasses
          </Link>
        </div>
      </div>

      <div className="relative animate-rise-delay mx-auto w-full max-w-[720px] translate-x-[1cm] md:max-w-none md:scale-[1.045] lg:scale-[1.19]">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0.16) 42%, transparent 70%)",
          }}
        />

        <div className="relative aspect-square">
          <Image
            src={HERO_IMAGE}
            alt="Mascotes Hollow no Roblox"
            fill
            priority
            sizes="(max-width: 768px) 95vw, 720px"
            className="object-contain object-center drop-shadow-[0_20px_60px_rgba(139,92,246,0.25)]"
          />
        </div>
      </div>
    </section>
  );
}
