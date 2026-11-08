import Image from "next/image";
import { CheckIcon, ClockIcon } from "./icons";

export function TrustRobux() {
  return (
    <section className="site-container py-16 md:py-24">
      <div className="grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="relative mx-auto w-full max-w-[480px] md:max-w-none">
          <Image
            src="/photos/6.png"
            alt="Mascote Hollow"
            width={480}
            height={640}
            className="w-full object-contain"
          />
        </div>

        <div>
          <h2 className="font-display text-3xl font-bold leading-tight text-white md:text-4xl">
            Compra transparente,{" "}
            <span className="text-[var(--secondary)]">entrega garantida.</span>
          </h2>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--fg-muted)]">
            Preço claro, taxa de 30% já inclusa no cálculo e entrega segura —
            sem pedir senha da sua conta Roblox.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <article className="rounded-xl border border-white/[0.06] bg-[var(--bg-panel)] p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--secondary)]/15 text-[var(--secondary)]">
                <CheckIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-white">
                Sem acesso à conta
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                Você só informa o username. Nada de senha ou dados sensíveis.
              </p>
            </article>

            <article className="rounded-xl border border-white/[0.06] bg-[var(--bg-panel)] p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
                <ClockIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-white">
                Suporte em português
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                Acompanhamento do pedido e ajuda rápida quando precisar.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
