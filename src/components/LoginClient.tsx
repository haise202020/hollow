"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/security/constants";
import { DiscordIcon } from "@/components/icons";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : null;
}

const ERROR_MAP: Record<string, string> = {
  discord_denied: "Login Discord cancelado.",
  discord_state: "Sessão Discord inválida. Tente de novo.",
  discord_config: "Discord OAuth ainda não configurado.",
  discord_token: "Falha ao validar o Discord.",
  discord_user: "Não foi possível ler sua conta Discord.",
  discord_callback: "Erro no retorno do Discord.",
};

const CHART_POINTS =
  "M0,118 C36,114 64,104 92,94 C128,80 148,86 176,70 C212,50 232,56 268,38 C304,22 332,28 400,14";

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const oauthError = useMemo(() => {
    const code = searchParams.get("error");
    return code ? ERROR_MAP[code] || "Falha no login." : "";
  }, [searchParams]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const csrf = readCookie(CSRF_COOKIE);
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { [CSRF_HEADER]: csrf } : {}),
        },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Não foi possível continuar.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Falha de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* ═══════════════════════════════════════════════════════
          BACKGROUND ÚNICO E CONTÍNUO
          Um único elemento cobre toda a tela com o gradiente.
          Nenhum outro container tem background próprio.
         ═══════════════════════════════════════════════════════ */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(105deg, #08050F 0%, #08050F 28%, #0A0612 38%, #0C0714 48%, #10091C 58%, #120A20 68%, #150C26 78%, #170E29 88%, #170E29 100%)",
        }}
      />

      {/* Ambient glows — posicionados sobre o background contínuo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-8%] top-[18%] z-0 h-[650px] w-[650px] rounded-full opacity-[0.10] blur-[160px]"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[8%] right-[15%] z-0 h-[500px] w-[500px] rounded-full opacity-[0.08] blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(88,101,242,0.4) 0%, transparent 70%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════
          CONTEÚDO — tudo posicionado sobre o background único
         ═══════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex min-h-screen">
        {/* ── LADO ESQUERDO: Formulário ── */}
        <section className="relative flex min-h-screen w-full flex-col px-8 py-10 sm:px-14 lg:w-1/2 lg:px-20">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition opacity-90 hover:opacity-100"
          >
            <Image
              src="/logo.png"
              alt="Hollow"
              width={36}
              height={36}
              priority
              className="h-9 w-auto"
            />
            <span className="font-display text-lg font-bold tracking-tight text-white">
              hollow
            </span>
          </Link>

          <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-12 lg:py-16">
            {/* Mode toggle */}
            <div className="mb-10 grid grid-cols-2 gap-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1.5 backdrop-blur-sm">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError("");
                  }}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                    mode === m
                      ? "bg-[var(--accent)] text-white shadow-[0_0_20px_var(--accent-glow)]"
                      : "text-[var(--fg-muted)] hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {m === "login" ? "Entrar" : "Criar conta"}
                </button>
              ))}
            </div>

            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white lg:text-[2.75rem]">
              {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[var(--fg-muted)]">
              {mode === "login"
                ? "Entre na sua conta para continuar comprando com segurança."
                : "Leva menos de um minuto. Sem senha do Roblox, sem complicação."}
            </p>

            {/* Discord OAuth */}
            <a
              href="/api/auth/discord"
              className="group mt-10 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#5865F2] to-[#6d78f5] px-5 py-4 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(88,101,242,0.3)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(88,101,242,0.4)] hover:brightness-110"
            >
              <DiscordIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              Entrar com Discord
            </a>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--fg-muted)]">
                Ou use usuário e senha
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--fg-muted)]"
                >
                  Usuário
                </label>
                <input
                  id="username"
                  name="username"
                  required
                  minLength={3}
                  maxLength={20}
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
                  }
                  placeholder="seu_usuario"
                  autoComplete="username"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-white/20 focus:border-[var(--accent)]/50 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(168,85,247,0.15)]"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--fg-muted)]"
                >
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={72}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === "login" ? "••••••••" : "mínimo 8 caracteres"
                  }
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-white/20 focus:border-[var(--accent)]/50 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(168,85,247,0.15)]"
                />
              </div>

              {(error || oauthError) && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[13px] font-medium text-red-300">
                    {error || oauthError}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-4 inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)] px-5 py-4 text-sm font-semibold text-white shadow-[0_4px_24px_var(--accent-glow)] transition-all duration-300 hover:shadow-[0_8px_40px_var(--accent-glow)] disabled:opacity-60"
              >
                {loading && (
                  <span className="mr-2.5 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {loading ? "Aguarde…" : "Continuar"}
              </button>
            </form>
          </div>

          <footer className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-[var(--fg-muted)]">
            <span>© {new Date().getFullYear()} Hollow</span>
            <Link href="/suporte" className="transition hover:text-[var(--accent)]">
              Termos
            </Link>
            <Link href="/suporte" className="transition hover:text-[var(--accent)]">
              Privacidade
            </Link>
          </footer>
        </section>

        {/* ── LADO DIREITO: Dashboard glassmorphism ──
            Posicionado com flex, SEM background próprio.
            O grid pattern usa mask-image para fade gradual à esquerda. */}
        <aside className="relative hidden min-h-screen w-1/2 items-center justify-center px-10 py-12 lg:flex">
          {/* Grid pattern com máscara de fade para a esquerda */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.7) 40%, black 60%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.7) 40%, black 60%)",
            }}
          />

          {/* Radial glows locais — sutis, apenas para dar profundidade aos cards */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[10%] top-[15%] h-[400px] w-[400px] rounded-full bg-[rgba(168,85,247,0.08)] blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[10%] right-[10%] h-[350px] w-[350px] rounded-full bg-[rgba(88,101,242,0.06)] blur-[100px]"
          />

          <div className="relative w-full max-w-[500px] space-y-4">
            {/* Glass stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Pedidos hoje", value: "847", delta: "+8.2%", bar: 78 },
                { label: "Robux entregues", value: "48k", delta: "+12.4%", bar: 92 },
                { label: "Tempo médio", value: "4 min", delta: "Instantâneo", bar: 98 },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl transition-all duration-500 hover:border-[var(--accent)]/30 hover:bg-white/[0.05] hover:shadow-[0_8px_32px_rgba(168,85,247,0.12)]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute right-0 top-0 h-8 w-8 bg-gradient-to-bl from-[var(--accent)]/10 to-transparent"
                  />
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--fg-muted)]">
                    {stat.label}
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold tabular-nums text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-emerald-400">
                    ↑ {stat.delta}
                  </p>
                  <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)]"
                      style={{ width: `${stat.bar}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Glass chart card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent"
              />

              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="font-display text-base font-bold text-white">
                    Atividade em tempo real
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--fg-muted)]">
                    Entregas nas últimas 24 horas
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    Live
                  </span>
                </span>
              </div>

              <div className="relative">
                <svg
                  viewBox="0 0 400 140"
                  className="h-40 w-full"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="glassChartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                    </linearGradient>
                    <filter id="chartGlow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path
                    d={`${CHART_POINTS} L400,140 L0,140 Z`}
                    fill="url(#glassChartFill)"
                  />
                  <path
                    d={CHART_POINTS}
                    fill="none"
                    stroke="var(--accent-bright)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    filter="url(#chartGlow)"
                  />
                </svg>

                <div className="absolute right-[10%] top-[15%] flex items-center gap-2 rounded-lg border border-white/[0.08] bg-black/60 px-2.5 py-1.5 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-bright)] shadow-[0_0_6px_var(--accent-glow)]" />
                  <span className="text-[10px] font-semibold tabular-nums text-white">
                    +127 agora
                  </span>
                </div>
              </div>

              <div className="mt-3 flex justify-between border-t border-white/[0.04] pt-3 text-[9px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
                <span>00h</span>
                <span>06h</span>
                <span>12h</span>
                <span>18h</span>
                <span>Agora</span>
              </div>
            </div>

            {/* Glass trust badge */}
            <div className="flex items-center justify-center gap-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-4 backdrop-blur-lg">
              <div className="text-center">
                <p className="font-display text-lg font-bold text-white">12k+</p>
                <p className="text-[9px] uppercase tracking-wider text-[var(--fg-muted)]">
                  Entregas
                </p>
              </div>
              <div className="h-8 w-px bg-white/[0.08]" />
              <div className="text-center">
                <p className="font-display text-lg font-bold text-white">PT-BR</p>
                <p className="text-[9px] uppercase tracking-wider text-[var(--fg-muted)]">
                  Suporte
                </p>
              </div>
              <div className="h-8 w-px bg-white/[0.08]" />
              <div className="text-center">
                <p className="font-display text-lg font-bold text-white">0</p>
                <p className="text-[9px] uppercase tracking-wider text-[var(--fg-muted)]">
                  Senhas
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}