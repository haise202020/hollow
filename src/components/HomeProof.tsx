import Image from "next/image";
import { DiscordIcon } from "./icons";

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-white/[0.06] bg-[var(--bg-elevated)] p-5 transition-all duration-300 hover:border-[var(--accent)]/25 hover:bg-[var(--bg-panel)]">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)]/15">
        {icon}
      </div>
      <h3 className="font-display text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--fg-muted)]">
        {description}
      </p>
    </div>
  );
}

export function HomeProof() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-[var(--bg)]">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.1),transparent_70%)]"
      />

      <div className="site-container relative py-16 md:py-24">
        {/* Section header */}
        <div className="mb-14 text-center md:mb-20">
          <span className="mb-3 inline-block rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-bright)]">
            Diferenciais
          </span>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Por que escolher a{" "}
            <span className="text-[var(--accent)]">Hollow?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-[var(--fg-muted)] md:text-lg">
            Transparência, segurança e suporte real em cada compra.
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-start lg:gap-12">
          {/* Left column — Features */}
          <div className="space-y-4">
            <FeatureCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Sem acesso à conta"
              description="Você só informa o username. Nada de senha ou dados sensíveis."
            />
            <FeatureCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Entrega rápida"
              description="Pedidos de Robux e gamepasses processados com agilidade."
            />
            <FeatureCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              }
              title="Melhor preço, sem surpresas"
              description="1.000 Robux por R$ 38,00 com taxa de 30% já inclusa."
            />
          </div>

          {/* Center — Mascot showcase */}
          <div className="relative mx-auto flex w-full max-w-[320px] flex-col items-center lg:max-w-[380px]">
            {/* Glow behind mascot */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.2),transparent_70%)] blur-3xl"
            />

            {/* Main mascot */}
            <div className="relative z-10 aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[var(--bg-panel)] to-[var(--bg-elevated)]">
              <Image
                src="/photos/7.png"
                alt="Mascote Hollow"
                fill
                sizes="(max-width: 768px) 320px, 380px"
                className="object-contain object-bottom p-4"
              />
            </div>

            {/* Price badge overlay */}
            <div className="relative z-20 -mt-8 w-[85%] rounded-2xl border border-white/[0.08] bg-[var(--bg-elevated)]/95 p-4 shadow-xl backdrop-blur-sm">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--fg-muted)]">
                Melhor preço garantido
              </p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-white">
                  R$ 38
                  <span className="text-base text-[var(--fg-muted)]">,00</span>
                </span>
                <span className="text-sm text-[var(--fg-muted)]">/ 1.000 Robux</span>
              </div>
              <p className="mt-1.5 text-[11px] text-[var(--fg-muted)]">
                Taxa de 30% já inclusa no valor
              </p>
            </div>
          </div>

          {/* Right column — Support & Trust */}
          <div className="space-y-4">
            <FeatureCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              }
              title="Suporte em português"
              description="Equipe Hollow pronta para ajudar com clareza e agilidade."
            />
            <FeatureCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Resposta ágil"
              description="Dúvidas sobre entrega, taxa ou gamepass? Respondemos rápido."
            />

            {/* Discord CTA */}
            <a
              href="https://discord.gg/hollowbux"
              target="_blank"
              rel="noreferrer"
              className="group mt-2 flex items-center justify-center gap-2.5 rounded-2xl border border-[#5865F2]/30 bg-[#5865F2]/10 px-5 py-4 text-sm font-semibold text-white transition-all hover:border-[#5865F2]/50 hover:bg-[#5865F2]/20 hover:shadow-[0_0_24px_rgba(88,101,242,0.2)]"
            >
              <DiscordIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
              Entrar no Discord
            </a>
          </div>
        </div>

        {/* Bottom trust badges */}
        <div className="mt-16 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-10 md:grid-cols-4">
          {[
            { label: "Entregas realizadas", value: "Milhares" },
            { label: "Taxa inclusa", value: "30%" },
            { label: "Suporte", value: "Português" },
            { label: "Segurança", value: "Sem senha" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="font-display text-2xl font-bold text-white md:text-3xl">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}