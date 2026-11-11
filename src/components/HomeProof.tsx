import { DiscordIcon } from "./icons";

function HudStat({
  value,
  label,
  barValue,
  accent = false,
}: {
  value: string;
  label: string;
  barValue: number;
  accent?: boolean;
}) {
  return (
    <div className="group relative">
      {/* HUD frame */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent p-5 backdrop-blur-sm transition-all duration-500 hover:border-[var(--accent)]/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
        {/* Corner accents */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-[var(--accent)]/50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 border-[var(--accent)]/50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-[var(--accent)]/50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-[var(--accent)]/50"
        />

        {/* Value */}
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-display text-3xl font-bold tabular-nums ${
              accent ? "text-[var(--accent-bright)]" : "text-white"
            }`}
          >
            {value}
          </span>
        </div>

        {/* Label */}
        <p className="mt-1.5 text-[11px] uppercase tracking-[0.15em] text-[var(--fg-muted)]">
          {label}
        </p>

        {/* Progress bar */}
        <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)] shadow-[0_0_8px_var(--accent-glow)] transition-all duration-1000"
            style={{ width: `${barValue}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function AchievementCard({
  icon,
  title,
  description,
  tag,
  glowColor = "purple",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag: string;
  glowColor?: "purple" | "emerald" | "amber" | "cyan";
}) {
  const glowMap = {
    purple: "rgba(168, 85, 247, 0.25)",
    emerald: "rgba(16, 185, 129, 0.25)",
    amber: "rgba(245, 158, 11, 0.25)",
    cyan: "rgba(6, 182, 212, 0.25)",
  };

  const accentMap = {
    purple: "text-[var(--accent-bright)]",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    cyan: "text-cyan-400",
  };

  const tagBgMap = {
    purple: "bg-[var(--accent)]/10 text-[var(--accent-bright)] border-[var(--accent)]/20",
    emerald: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    amber: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    cyan: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  };

  return (
    <div className="group relative">
      {/* Ambient glow on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: glowMap[glowColor] }}
      />

      <div className="relative h-full overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 backdrop-blur-sm transition-all duration-500 group-hover:border-white/[0.15]">
        {/* Top scanline effect */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent"
        />

        {/* Tag */}
        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${tagBgMap[glowColor]}`}>
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
          {tag}
        </div>

        {/* Icon badge */}
        <div
          className={`mt-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-black/40 ${accentMap[glowColor]} transition-transform duration-500 group-hover:scale-110`}
        >
          {icon}
        </div>

        {/* Title */}
        <h3 className="mt-5 font-display text-xl font-bold text-white">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

function PipelineStep({
  step,
  title,
  subtitle,
  icon,
}: {
  step: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center text-center">
      {/* Icon circle */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent)]/15 to-transparent text-[var(--accent-bright)] shadow-[0_0_24px_rgba(168,85,247,0.2)] md:h-20 md:w-20">
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--accent)]/40 bg-[var(--bg-elevated)] text-[10px] font-bold text-[var(--accent-bright)]">
          {step}
        </span>
        {icon}
      </div>

      {/* Text */}
      <h4 className="mt-4 font-display text-base font-bold text-white md:text-lg">
        {title}
      </h4>
      <p className="mt-1 text-xs text-[var(--fg-muted)] md:text-sm">
        {subtitle}
      </p>
    </div>
  );
}

export function HomeProof() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg)]">
      {/* Subtle background grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Ambient orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-10%] top-[15%] h-[420px] w-[420px] rounded-full bg-[rgba(168,85,247,0.08)] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-5%] bottom-[10%] h-[380px] w-[380px] rounded-full bg-[rgba(52,211,153,0.06)] blur-[120px]"
      />

      <div className="site-container relative py-20 md:py-28">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-2xl text-center md:mb-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-bright)]">
              Missão Hollow
            </span>
          </div>

          <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl">
            Cada compra é uma{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)] bg-clip-text text-transparent">
                conquista desbloqueada
              </span>
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)]"
              />
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base text-[var(--fg-muted)] md:text-lg">
            Quatro promessas reais. Zero promessas vazias. É assim que entregamos cada pedido.
          </p>
        </div>

        {/* HUD stats row */}
        <div className="mb-16 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <HudStat value="100%" label="Entregas monitoradas" barValue={100} />
          <HudStat
            value="30%"
            label="Taxa transparente"
            barValue={100}
            accent
          />
          <HudStat value="24/7" label="Suporte ativo" barValue={95} />
          <HudStat value="0" label="Senhas solicitadas" barValue={0} />
        </div>

        {/* Achievement cards grid */}
        <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          <AchievementCard
            tag="Promessa #01"
            glowColor="purple"
            icon={
              <svg
                className="h-6 w-6"
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
            title="Compra transparente"
            description="Preço claro desde o início. A taxa de 30% já está inclusa no cálculo, sem surpresas na hora de pagar."
          />

          <AchievementCard
            tag="Promessa #02"
            glowColor="cyan"
            icon={
              <svg
                className="h-6 w-6"
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
            title="Sem acesso à conta"
            description="Você só informa o username do Roblox. Nada de senha ou dados sensíveis. Sua conta continua sua."
          />

          <AchievementCard
            tag="Promessa #03"
            glowColor="emerald"
            icon={
              <svg
                className="h-6 w-6"
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
            title="Entrega em minutos"
            description="Pedidos processados com agilidade. Você confirma o pagamento e acompanha a entrega em tempo real."
          />

          <AchievementCard
            tag="Promessa #04"
            glowColor="amber"
            icon={
              <svg
                className="h-6 w-6"
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
            title="Melhor preço, zero surpresa"
            description="1.000 Robux por R$ 38,00 com taxa já inclusa. Transparência total no valor final — sem cobranças ocultas."
          />
        </div>

        {/* Pipeline: como funciona */}
        <div className="mt-20 md:mt-28">
          <div className="mb-12 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--accent-bright)]">
              Fluxo Hollow
            </span>
            <h3 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
              Três passos. Sem enrolação.
            </h3>
          </div>

          <div className="relative">
            {/* Connecting line (desktop) */}
            <div
              aria-hidden
              className="absolute left-[10%] right-[10%] top-8 hidden h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent md:top-10 md:block"
            />
            <div
              aria-hidden
              className="absolute left-[10%] right-[10%] top-8 hidden h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 blur-sm to-transparent md:top-10 md:block"
            />

            <div className="relative grid gap-10 md:grid-cols-3 md:gap-8">
              <PipelineStep
                step="01"
                title="Escolhe"
                subtitle="Selecione Robux ou um gamepass e informe seu username do Roblox"
                icon={
                  <svg
                    className="h-7 w-7 md:h-8 md:w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
              />

              <PipelineStep
                step="02"
                title="Paga"
                subtitle="Finalize via PIX com valor total já claro, taxa inclusa"
                icon={
                  <svg
                    className="h-7 w-7 md:h-8 md:w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                }
              />

              <PipelineStep
                step="03"
                title="Recebe"
                subtitle="Acompanhe a entrega no chat e receba seus Robux com segurança"
                icon={
                  <svg
                    className="h-7 w-7 md:h-8 md:w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                }
              />
            </div>
          </div>
        </div>

        {/* Discord CTA */}
        <div className="mt-20 md:mt-28">
          <div className="relative overflow-hidden rounded-3xl border border-[#5865F2]/20 bg-gradient-to-br from-[#5865F2]/10 via-[var(--bg-elevated)] to-[var(--bg-panel)]">
            {/* Decorative glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#5865F2]/15 blur-[100px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-[80px]"
            />

            <div className="relative z-10 grid items-center gap-8 p-8 md:grid-cols-[1.2fr_auto] md:p-12">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                    Suporte online agora
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold text-white md:text-3xl">
                  Precisa de ajuda?{" "}
                  <span className="text-[var(--accent)]">Suporte real.</span>
                </h3>
                <p className="mt-2 max-w-lg text-base text-[var(--fg-muted)]">
                  Atendimento pelo Discord com equipe em português. Dúvidas
                  sobre Robux, gamepasses ou status do pedido resolvidas por
                  pessoas reais.
                </p>

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
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
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-[#5865F2] px-8 py-4 text-sm font-semibold text-white shadow-[0_0_30px_rgba(88,101,242,0.3)] transition-all hover:bg-[#6d78f5] hover:shadow-[0_0_40px_rgba(88,101,242,0.4)]"
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