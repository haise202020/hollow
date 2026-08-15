import Image from "next/image";
import { BoltIcon, ChatIcon } from "./icons";

export function SupportHighlight() {
  return (
    <section className="site-container relative z-10 -mt-[3.5cm] overflow-visible py-12 md:py-16">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-8 lg:gap-10">
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight text-white md:text-4xl lg:text-[2.75rem]">
            Complicou? A gente{" "}
            <span className="text-[var(--purple-bright)]">descomplica.</span>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--fg-muted)] md:text-lg">
            Nosso atendimento é pelo Discord: dúvidas sobre Robux, gamepasses
            ou status do pedido são resolvidas com suporte humano em português.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <ChatIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-white">
                Suporte humano
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                Fale com a equipe Hollow em português e resolva seu pedido com
                clareza do início ao fim.
              </p>
            </article>

            <article className="p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--purple)]/20 text-[var(--purple-bright)]">
                <BoltIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-white">
                Resposta rápida
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                Dúvidas sobre entrega, taxa ou gamepass? A gente responde com
                agilidade para você não perder tempo.
              </p>
            </article>
          </div>

          <a
            href="https://discord.gg/hollowbux"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex text-sm font-semibold text-[var(--purple-bright)] transition hover:text-white"
          >
            Entrar no Discord →
          </a>
        </div>

        <div className="relative mx-auto w-full max-w-[640px] translate-x-[1.5cm] overflow-visible md:max-w-none">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/12 blur-2xl"
          />
          <Image
            src="/photos/8.png"
            alt="Mascote Hollow do suporte"
            width={1411}
            height={1115}
            sizes="(max-width: 768px) 95vw, 640px"
            className="relative z-[1] h-auto w-full object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
