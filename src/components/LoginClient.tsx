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

      {/* Right panel — stats & activity dashboard */}
      <aside className="relative hidden overflow-hidden border-l border-white/[0.06] bg-[#050505] lg:flex lg:items-center lg:justify-center lg:px-10 lg:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,var(--accent-glow),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent"
        />

        <div className="relative w-full max-w-[480px]">
          {/* Indicator dots */}
          <div className="mb-6 flex justify-center gap-1.5">
            <span className="h-0.5 w-8 rounded-full bg-[var(--accent)]" />
            <span className="h-0.5 w-6 rounded-full bg-white/10" />
            <span className="h-0.5 w-6 rounded-full bg-white/10" />
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Pedidos hoje", value: "847", delta: "+8.2%" },
              { label: "Robux", value: "48k", delta: "+12.4%" },
              { label: "Entrega média", value: "4 min", delta: "instantâneo" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-3.5 transition-colors hover:border-[var(--accent)]/20"
              >
                <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--fg-muted)]">
                  {stat.label}
                </p>
                <p className="mt-2.5 font-display text-xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[10px] font-medium text-[var(--accent-bright)]">
                  ↑ {stat.delta}
                </p>
              </div>
            ))}
          </div>

          {/* Activity chart card */}
          <div className="mt-3 rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-white">
                  Atividade Hollow
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--fg-muted)]">
                  Entregas realizadas nas últimas 24h
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--accent-bright)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-bright)] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent-bright)]" />
                </span>
                Online
              </span>
            </div>

            <svg
              viewBox="0 0 400 130"
              className="h-36 w-full"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="hollowChartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`${CHART_POINTS} L400,130 L0,130 Z`}
                fill="url(#hollowChartFill)"
              />
              <path
                d={CHART_POINTS}
                fill="none"
                stroke="var(--accent-bright)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>

            <div className="mt-2 flex justify-between text-[9px] uppercase tracking-[0.1em] text-[var(--fg-muted)]">
              <span>00h</span>
              <span>06h</span>
              <span>12h</span>
              <span>18h</span>
              <span>22h</span>
            </div>
          </div>

          {/* Trust line */}
          <p className="mt-5 text-center text-[11px] leading-relaxed text-[var(--fg-muted)]">
            Mais de <span className="font-semibold text-white">12.000 entregas</span> realizadas com sucesso.
            <br />
            Suporte em português · Sem senha do Roblox
          </p>
        </div>
      </aside>
    </div>
  );
}
