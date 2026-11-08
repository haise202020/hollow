import Image from "next/image";

export function DeliveryHighlights() {
  return (
    <section className="site-container relative z-10 -mt-24 py-16 md:-mt-36 md:py-20">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-8 lg:gap-12">
        <div className="text-center md:text-right">
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
            Entrega rápida,{" "}
            <span className="text-[var(--accent)]">sem enrolação.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--fg-muted)]">
            Você escolhe, confirma e recebe com acompanhamento até a conclusão.
            Pedidos de Robux e gamepasses processados com agilidade.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[400px] md:max-w-[440px] lg:max-w-[520px]">
          <Image
            src="/photos/7.png"
            alt="Mascote Hollow"
            width={1024}
            height={1536}
            sizes="(max-width: 768px) 70vw, 520px"
            className="h-auto w-full object-contain"
            priority
          />
        </div>

        <div className="text-center md:text-left">
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
            Melhor preço,{" "}
            <span className="text-[var(--secondary)]">sem surpresas.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--fg-muted)]">
            1.000 Robux por R$ 38,00 com taxa de 30% já inclusa. Transparência
            total no valor que você paga.
          </p>
        </div>
      </div>
    </section>
  );
}
