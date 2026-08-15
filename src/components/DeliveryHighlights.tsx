import Image from "next/image";

export function DeliveryHighlights() {
  return (
    <section className="site-container relative z-10 -mt-[9.5cm] py-12 md:py-16">
      <div className="grid items-center gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-6 lg:gap-10">
        <div className="text-center md:text-right">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--purple-bright)]">
            Velocidade
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold text-white md:text-3xl lg:text-[2rem]">
            A entrega mais rápida do Brasil
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--fg-muted)] md:text-base">
            Pedidos de Robux e gamepasses com entrega ágil. Você escolhe,
            confirma e recebe sem enrolação — com acompanhamento até a
            conclusão.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[360px] overflow-visible sm:max-w-[420px] md:max-w-[480px] lg:max-w-[560px]">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/12 blur-2xl"
          />
          <Image
            src="/photos/7.png"
            alt="Mascote Hollow no trono com Robux"
            width={1024}
            height={1536}
            sizes="(max-width: 768px) 80vw, 560px"
            className="relative z-[1] h-auto w-full object-contain"
            priority
          />
        </div>

        <div className="text-center md:text-left">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--purple-bright)]">
            Preço
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold text-white md:text-3xl lg:text-[2rem]">
            A loja mais barata do Brasil
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--fg-muted)] md:text-base">
            Cotação competitiva com 1.000 Robux por R$ 38,00. Transparência no
            valor, taxa de 30% já coberta no cálculo e o melhor custo-benefício
            para o seu pedido.
          </p>
        </div>
      </div>
    </section>
  );
}
