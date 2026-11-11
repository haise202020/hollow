export function HomeProof() {
  return (
    <section className="relative bg-[#07060B]">
      <div className="site-container py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_1px_1fr] md:gap-16 lg:gap-24">
          {/* Coluna esquerda */}
          <div className="flex flex-col justify-center">
            {/* Tag com bullet */}
            <div className="mb-6 flex items-center gap-2.5">
              <span
                aria-hidden
                className="h-2 w-2 rounded-full bg-[#A855F7]"
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C084FC]">
                Nossos diferenciais
              </span>
            </div>

            {/* Título */}
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-[3.5rem]">
              Por que escolher{" "}
              <span className="text-[#A855F7]">a Hollow?</span>
            </h2>

            {/* Subtítulo */}
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#9CA3AF] md:text-lg">
              Robux e Gamepasses com segurança, agilidade e total transparência.
            </p>

            {/* Barra de acento */}
            <div
              aria-hidden
              className="mt-10 h-[3px] w-20 rounded-full bg-[#A855F7]"
            />
          </div>

          {/* Separador vertical */}
          <div
            aria-hidden
            className="hidden w-px self-stretch bg-white/[0.07] md:block"
          />

          {/* Coluna direita — features */}
          <div className="flex flex-col justify-center">
            <FeatureItem
              number="01"
              tag="TRANSPARÊNCIA"
              title="Preço justo e sem surpresas."
              description="Você paga o valor exibido, sem taxas ocultas."
              isLast={false}
            />
            <FeatureItem
              number="02"
              tag="SEGURANÇA"
              title="Sua conta sempre protegida."
              description="Não solicitamos senha ou dados sensíveis."
              isLast={false}
            />
            <FeatureItem
              number="03"
              tag="AGILIDADE"
              title="Entrega rápida e acompanhada."
              description="Seu pedido é processado com prioridade."
              isLast={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({
  number,
  tag,
  title,
  description,
  isLast,
}: {
  number: string;
  tag: string;
  title: string;
  description: string;
  isLast: boolean;
}) {
  return (
    <div
      className={`py-7 ${
        isLast ? "" : "border-b border-white/[0.07]"
      }`}
    >
      {/* Número + Tag na mesma linha */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C084FC] tabular-nums">
        {number} — {tag}
      </p>

      {/* Título */}
      <h3 className="mt-3 font-display text-xl font-bold leading-tight text-white md:text-2xl">
        {title}
      </h3>

      {/* Descrição */}
      <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF] md:text-[15px]">
        {description}
      </p>
    </div>
  );
}