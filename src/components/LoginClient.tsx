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
    <div className="relative min-h-screen bg-[var(--bg)] text-white lg:grid lg:grid-cols-2">
      {/* Ambient glow behind the form side */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/3 h-[600px] w-[600px] rounded-full opacity-20 blur-[160px]"
        style={{
          background:
            "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
        }}
      />

      <section className="relative flex min-h-screen flex-col px-8 py-7 sm:px-12 lg:px-16">
        <Link
          href="/"
          className="flex items-center transition opacity-90 hover:opacity-100"
        >
          <Image
            src="/logo.png"
            alt="Hollow"
            width={32}
            height={32}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center py-10">
          {/* Mode toggle */}
          <div className="mb-8 grid grid-cols-2 gap-1 rounded-xl border border-white/[0.08] bg-[#101016] p-1 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={`rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                  mode === m
                    ? "bg-[var(--accent)] text-white shadow-[0_0_12px_var(--accent-glow)]"
                    : "text-[var(--fg-muted)] hover:text-white"
                }`}
              >
                {m === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <h1 className="font-display text-[1.85rem] font-bold leading-tight tracking-tight text-white">
            {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--fg-muted)]">
            {mode === "login"
              ? "Entre na sua conta para continuar comprando com segurança."
              : "Leva menos de um minuto. Sem senha do Roblox, sem complicação."}
          </p>

          {/* Discord OAuth */}
          <a
            href="/api/auth/discord"
            className="mt-8 group inline-flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#5865F2] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_0_16px_rgba(88,101,242,0.25)] transition-all hover:brightness-110 hover:shadow-[0_0_24px_rgba(88,101,242,0.35)]"
          >
            <DiscordIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
            Entrar com Discord
          </a>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--fg-muted)]">
              Ou use usuário e senha
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-muted)]"
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
                className="w-full rounded-lg border border-white/[0.08] bg-[#0a0a0a] px-3.5 py-3 text-[13px] text-white outline-none transition-all duration-200 placeholder:text-white/20 focus:border-[var(--accent)]/50 focus:shadow-[0_0_0_3px_var(--accent-glow)]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-muted)]"
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
                className="w-full rounded-lg border border-white/[0.08] bg-[#0a0a0a] px-3.5 py-3 text-[13px] text-white outline-none transition-all duration-200 placeholder:text-white/20 focus:border-[var(--accent)]/50 focus:shadow-[0_0_0_3px_var(--accent-glow)]"
              />
            </div>

            {(error || oauthError) && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5">
                <p className="text-[12px] font-medium text-red-300">
                  {error || oauthError}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 inline-flex w-full items-center justify-center overflow-hidden rounded-lg bg-[var(--accent)] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_0_20px_var(--accent-glow)] transition-all duration-200 hover:bg-[var(--accent-bright)] hover:shadow-[0_0_32px_var(--accent-glow)] disabled:opacity-60 disabled:hover:bg-[var(--accent)]"
            >
              {loading && (
                <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {loading ? "Aguarde…" : "Continuar"}
            </button>
          </form>
        </div>

        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--fg-muted)]">
          <span>© {new Date().getFullYear()} Hollow</span>
          <Link href="/suporte" className="transition hover:text-[var(--accent)]">
            Termos
          </Link>
          <Link href="/suporte" className="transition hover:text-[var(--accent)]">
            Privacidade
          </Link>
        </footer>
      </section>

      {/* Right panel — glassmorphism dashboard */}
      <aside className="relative hidden overflow-hidden lg:flex lg:items-center lg:justify-center lg:px-10 lg:py-12">
        {/* Background layers */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[#05030e]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(168,85,247,0.15),transparent_60%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(88,101,242,0.08),transparent_50%)]"
        />
        {/* Subtle grid pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
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
                {/* Corner accent */}
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

                {/* Mini progress bar */}
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
            {/* Top glow line */}
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

            {/* Chart area with glass effect */}
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

              {/* Floating data point indicator */}
              <div className="absolute right-[10%] top-[15%] flex items-center gap-2 rounded-lg border border-white/[0.08] bg-black/60 px-2.5 py-1.5 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-bright)] shadow-[0_0_6px_var(--accent-glow)]" />
                <span className="text-[10px] font-semibold tabular-nums text-white">
                  +127 agora
                </span>
              </div>
            </div>

            {/* Time axis */}
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
  );
}
