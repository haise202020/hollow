import { DiscordIcon } from "./icons";

function GlowOrb({
  className,
  color = "accent",
}: {
  className?: string;
  color?: "accent" | "emerald" | "amber";
}) {
  const colors = {
    accent: "rgba(168, 85, 247, 0.15)",
    emerald: "rgba(52, 211, 153, 0.12)",
    amber: "rgba(251, 191, 36, 0.1)",
  };

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-[100px] ${className ?? ""}`}
      style={{ background: colors[color] }}
    />
  );
}

function StatCard({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="group relative">
      <div
        className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
          accent
            ? "border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent)]/10 to-transparent"
            : "border-white/[0.06] bg-[var(--bg-elevated)]"
        }`}
      >
        <p
          className={`font-display text-4xl font-bold tracking-tight md:text-5xl ${
            accent ? "text-[var(--accent-bright)]" : "text-white"
          }`}
        >
          {value}
        </p>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">{label}</p>
      </div>
    </div>
  );
}

function FeatureBlock({
  number,
  title,
  description,
  icon,
  large = false,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  large?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[var(--bg-elevated)] transition-all duration-500 hover:border-[var(--accent)]/30 hover:shadow-[0_8px_60px_-12px_rgba(168,85,247,0.15)] ${
        large ? "p-8 md:p-10" : "p-6 md:p-8"
      }`}
    >
      {/* Background gradient on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(168,85,247,0.06), transparent 60%)",
        }}
      />

      <div className="relative z-10">
        {/* Number + Icon row */}
        <div className="mb-5 flex items-start justify-between">
          <span className="font-mono text-xs font-medium text-[var(--fg-muted)]">
            {number}
          </span>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)]/15">
            {icon}
          </div>
        </div>

        {/* Content */}
        <h3
          className={`font-display font-bold text-white ${
            large ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
          }`}
        >
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--fg-muted)] md:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

export function HomeProof() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg)]">
      {/* Ambient background effects */}
      <GlowOrb className="left-[-10%] top-[10%] h-[400px] w-[400px]" />
      <GlowOrb
        className="right-[-5%] top-[40%] h-[350px] w-[350px]"
        color="emerald"
      />
      <GlowOrb
        className="bottom-[5%] left-[30%] h-[300px] w-[300px]"
        color="amber"
      />

      {/* Grid pattern overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="site-container relative py-20 md:py-28 lg:py-32">
        {/* Section header */}
        <div className="mb-16 max-w-2xl md:mb-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--accent-bright)]">
              Nossos diferenciais
            </span>
          </div>

          <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
            Por que escolher a{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)] bg-clip-text text-transparent">
                Hollow?
              </span>
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)]"
              />
            </span>
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-[var(--fg-muted)] md:text-xl">
            Transparência, segurança e suporte real em cada compra.
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-12 grid grid-cols-2 gap-4 md:mb-16 md:grid-cols-4 md:gap-5">
          <StatCard value="100%" label="Entregas monitoradas" />
          <StatCard value="30%" label="Taxa já inclusa" accent />
          <StatCard value="24/7" label="Suporte ativo" />
          <StatCard value="0" label="Senhas solicitadas" />
        </div>

        {/* Main features grid — asymmetric layout */}
        <div className="grid gap-5 md:grid-cols-6 md:gap-6">
          {/* Large card — spans 4 columns */}
          <div className="md:col-span-4">
            <FeatureBlock
              number="01"
              title="Compra transparente, entrega garantida"
              description="Preço claro desde o início. A taxa de 30% já está inclusa no cálculo, sem surpresas na hora de pagar. Você sabe exatamente o que está comprando e quanto vai custar."
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              }
              large
            />
          </div>

          {/* Small card — spans 2 columns */}
          <div className="md:col-span-2">
            <FeatureBlock
              number="02"
              title="Sem acesso à conta"
              description="Você só informa o username do Roblox. Nada de senha ou dados sensíveis."
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />
          </div>

          {/* Small card — spans 2 columns */}
          <div className="md:col-span-2">
            <FeatureBlock
              number="03"
              title="Entrega rápida"
              description="Pedidos processados com agilidade, sem enrolação."
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
            />
          </div>

          {/* Medium card — spans 4 columns */}
          <div className="md:col-span-4">
            <FeatureBlock
              number="04"
              title="Melhor preço, sem surpresas"
              description="1.000 Robux por R$ 38,00 com taxa já inclusa. Transparência total no valor que você paga — sem cobranças ocultas ou adicionais inesperados no final da compra."
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              large
            />
          </div>
        </div>

        {/* Support CTA section */}
        <div className="mt-12 md:mt-16">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[var(--bg-elevated)] via-[var(--bg-panel)] to-[var(--bg-elevated)]">
            {/* Inner glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-[var(--accent)]/10 blur-[80px]"
            />

            <div className="relative z-10 grid items-center gap-8 p-8 md:grid-cols-[1fr_auto] md:p-12">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                    Suporte online
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold text-white md:text-3xl">
                  Precisa de ajuda?{" "}
                  <span className="text-[var(--accent)]">Suporte real.</span>
                </h3>
                <p className="mt-2 max-w-lg text-base text-[var(--fg-muted)]">
                  Atendimento pelo Discord com equipe em português. Dúvidas
                  sobre Robux, gamepasses ou status do pedido resolvidas de
                  verdade por pessoas reais.
                </p>

                <div className="mt-5 flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-2 text-[var(--fg-muted)]">
                    <svg
                      className="h-4 w-4 text-[var(--accent)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Equipe em português
                  </span>
                  <span className="flex items-center gap-2 text-[var(--fg-muted)]">
                    <svg
                      className="h-4 w-4 text-[var(--accent)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Resposta ágil
                  </span>
                  <span className="flex items-center gap-2 text-[var(--fg-muted)]">
                    <svg
                      className="h-4 w-4 text-[var(--accent)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Acompanhamento do pedido
                  </span>
                </div>
              </div>

              <a
                href="https://discord.gg/hollowbux"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 rounded-2xl bg-[#5865F2] px-7 py-4 text-sm font-semibold text-white transition-all hover:bg-[#6d78f5] hover:shadow-[0_0_40px_rgba(88,101,242,0.3)]"
              >
                <DiscordIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
                Entrar no Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}