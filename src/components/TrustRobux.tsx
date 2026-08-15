import Image from "next/image";
import { CheckIcon, ClockIcon } from "./icons";

export function TrustRobux() {
  return (
    <section className="site-container mt-[0.5cm] pb-14 pt-0 md:pb-20">
      <div className="grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-10 lg:gap-12">
        <div className="relative mx-auto w-full max-w-[560px] aspect-[3/4] -translate-x-[1cm] overflow-visible md:max-w-none">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/12 blur-2xl"
          />
          <Image
            src="/photos/6.png"
            alt="Mascote Hollow"
            fill
            sizes="(max-width: 768px) 90vw, 560px"
            className="relative z-[1] object-contain object-center"
            priority
          />
        </div>

        <div>
          <h2 className="font-display text-3xl font-bold leading-tight text-white md:text-4xl lg:text-[2.75rem]">
            Os robux aqui são{" "}
            <span className="text-[var(--purple-bright)]">confiáveis</span>{" "}
            mesmo?
          </h2>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--fg-muted)] md:text-lg">
            Sim. Na Hollow você compra com transparência: preço claro, taxa de
            30% já coberta no cálculo e entrega feita com segurança — sem pedir
            a senha da sua conta Roblox.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <CheckIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-white">
                Compra segura
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                Processo protegido, sem acesso à sua conta. Você só informa o
                necessário para a entrega.
              </p>
            </article>

            <article className="p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--purple)]/20 text-[var(--purple-bright)]">
                <ClockIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-white">
                Entrega rápida
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                Pedidos de Robux e gamepasses com acompanhamento e suporte
                humano em português.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
