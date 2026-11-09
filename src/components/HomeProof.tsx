import Image from "next/image";
import { DiscordIcon } from "./icons";

function ProofCard({
  imageSrc,
  imageAlt,
  imageHeight = "h-[220px] md:h-[280px]",
  title,
  titleAccent,
  description,
  children,
}: {
  imageSrc: string;
  imageAlt: string;
  imageHeight?: string;
  title: React.ReactNode;
  titleAccent?: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--bg-elevated)] transition-all duration-300 hover:border-[var(--accent)]/30 hover:shadow-[0_8px_40px_rgba(168,85,247,0.08)]">
      {/* Card glow on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(168,85,247,0.06), transparent 60%)",
        }}
      />

      {/* Mascot area */}
      <div className={`relative flex items-end justify-center ${imageHeight} overflow-hidden bg-gradient-to-b from-[var(--bg-panel)] to-[var(--bg-elevated)]`}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg-elevated)] to-transparent"
        />
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={480}
          height={640}
          sizes="(max-width: 768px) 80vw, 360px"
          className="w-auto max-w-[85%] object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content area */}
      <div className="relative flex flex-1 flex-col p-6 pt-4">
        <h2 className="font-display text-xl font-bold leading-tight text-white">
          {title}{" "}
          {titleAccent && (
            <span className="text-[var(--accent)]">{titleAccent}</span>
          )}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--fg-muted)]">
          {description}
        </p>

        {children && <div className="mt-5 flex-1">{children}</div>}
      </div>
    </div>
  );
}

function FeatureItem({
  title,
  description,
  accent = false,
}: {
  title: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <div className={`border-l-2 pl-4 ${accent ? "border-[var(--accent)]" : "border-white/15"}`}>
      <h3 className="font-display text-sm font-semibold text-white">
        {title}
      </h3>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--fg-muted)]">
        {description}
      </p>
    </div>
  );
}

export function HomeProof() {
  return (
    <section className="relative border-t border-white/[0.06] bg-[var(--bg)]">
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[600px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent_70%)]"
      />

      <div className="site-container relative py-16 md:py-24">
        {/* Section header */}
        <div className="mb-12 text-center md:mb-16">
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Por que escolher a{" "}
            <span className="text-[var(--accent)]">Hollow?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--fg-muted)]">
            Transparência, segurança e suporte real em cada compra.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {/* Card 1: Compra transparente */}
          <ProofCard
            imageSrc="/photos/6.png"
            imageAlt="Mascote Hollow conferindo um Robux"
            imageHeight="h-[200px] md:h-[260px]"
            title="Compra transparente,"
            titleAccent="entrega garantida."
            description="Preço claro, taxa de 30% já inclusa no cálculo e entrega segura — sem pedir senha da sua conta Roblox."
          >
            <div className="grid gap-4">
              <FeatureItem
                accent
                title="Sem acesso à conta"
                description="Você só informa o username. Nada de senha ou dados sensíveis."
              />
              <FeatureItem
                title="Suporte em português"
                description="Acompanhamento do pedido e ajuda rápida quando precisar."
              />
            </div>
          </ProofCard>

          {/* Card 2: Entrega rápida + Preço */}
          <ProofCard
            imageSrc="/photos/7.png"
            imageAlt="Mascote Hollow no trono de Robux"
            imageHeight="h-[240px] md:h-[320px]"
            title="Entrega rápida,"
            titleAccent="sem enrolação."
            description="Você escolhe, confirma e recebe com acompanhamento até a conclusão. Pedidos processados com agilidade."
          >
            <div className="mt-2 rounded-xl border border-white/[0.06] bg-[var(--bg-panel)] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--fg-muted)]">
                Melhor preço, sem surpresas
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-white">
                  R$ 38
                  <span className="text-lg text-[var(--fg-muted)]">,00</span>
                </span>
                <span className="text-sm text-[var(--fg-muted)]">
                  / 1.000 Robux
                </span>
              </div>
              <p className="mt-2 text-[13px] text-[var(--fg-muted)]">
                Taxa de 30% já inclusa. Transparência total.
              </p>
            </div>
          </ProofCard>

          {/* Card 3: Suporte real */}
          <ProofCard
            imageSrc="/photos/8.png"
            imageAlt="Mascote Hollow do suporte"
            imageHeight="h-[180px] md:h-[220px]"
            title="Precisa de ajuda?"
            titleAccent="Suporte real."
            description="Atendimento pelo Discord com equipe em português. Dúvidas sobre Robux, gamepasses ou status do pedido resolvidas de verdade."
          >
            <div className="grid gap-4">
              <div>
                <h3 className="font-display text-sm font-semibold text-white">
                  Equipe em português
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--fg-muted)]">
                  Fale direto com a equipe Hollow e resolva seu pedido com clareza.
                </p>
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-white">
                  Resposta ágil
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--fg-muted)]">
                  Dúvidas sobre entrega, taxa ou gamepass? Respondemos rápido.
                </p>
              </div>
            </div>

            <a
              href="https://discord.gg/hollowbux"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#5865F2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6d78f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b96ff]"
            >
              <DiscordIcon className="h-4 w-4" />
              Entrar no Discord
            </a>
          </ProofCard>
        </div>
      </div>
    </section>
  );
}