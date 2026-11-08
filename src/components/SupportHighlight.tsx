import Image from "next/image";
import { BoltIcon, ChatIcon } from "./icons";

export function SupportHighlight() {
  return (
    <section className="site-container relative z-10 -mt-14 overflow-visible py-12 md:-mt-16 md:py-16">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-8 lg:gap-10">
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight text-white md:text-4xl">
            Precisa de ajuda?{" "}
            <span className="text-[var(--secondary)]">Suporte real.</span>
          </h2>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--fg-muted)]">
            Atendimento pelo Discord com equipe em português. Dúvidas sobre
            Robux, gamepasses ou status do pedido resolvidas de verdade.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <article className="rounded-xl border border-white/[0.06] bg-[var(--bg-panel)] p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--secondary)]/15 text-[var(--secondary)]">
                <ChatIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-white">
                Equipe em português
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                Fale direto com a equipe Hollow e resolva seu pedido com clareza.
              </p>
            </article>

            <article className="rounded-xl border border-white/[0.06] bg-[var(--bg-panel)] p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
                <BoltIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-white">
                Resposta ágil
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                Dúvidas sobre entrega, taxa ou gamepass? Respondemos rápido.
              </p>
            </article>
          </div>

          <a
            href="https://discord.gg/hollowbux"
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--accent-bright)]"
          >
            Entrar no Discord
          </a>
        </div>

        <div className="relative mx-auto w-full max-w-[560px] md:max-w-none">
          <Image
            src="/photos/8.png"
            alt="Mascote Hollow do suporte"
            width={1411}
            height={1115}
            sizes="(max-width: 768px) 90vw, 560px"
            className="h-auto w-full object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
