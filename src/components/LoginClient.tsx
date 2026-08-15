"use client";

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
    <div className="min-h-screen bg-black text-white lg:grid lg:grid-cols-2">
      <section className="relative flex min-h-screen flex-col px-8 py-7 sm:px-12 lg:px-16">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-white"
        >
          hollow
        </Link>

        <div className="mx-auto flex w-full max-w-[340px] flex-1 flex-col justify-center py-10">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-white/[0.08] bg-[#101016] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`rounded-lg px-3 py-2.5 text-[13px] font-semibold transition ${
                mode === "login"
                  ? "bg-[var(--purple)] text-white"
                  : "text-[var(--fg-muted)] hover:text-white"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`rounded-lg px-3 py-2.5 text-[13px] font-semibold transition ${
                mode === "register"
                  ? "bg-[var(--purple)] text-white"
                  : "text-[var(--fg-muted)] hover:text-white"
              }`}
            >
              Criar conta
            </button>
          </div>

          <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight text-white">
            {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="mt-2 text-[13px] text-[var(--fg-muted)]">
            {mode === "login"
              ? "Entre na sua conta para continuar"
              : "Leva menos de um minuto para começar"}
          </p>

          <a
            href="/api/auth/discord"
            className="mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#5865F2] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:brightness-110"
          >
            <DiscordIcon className="h-4 w-4" />
            Entrar com Discord
          </a>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--fg-muted)]">
              Ou continue com usuário
            </span>
            <div className="h-px flex-1 bg-white/[0.08]" />
          </div>

          <form onSubmit={submit} className="space-y-3.5" noValidate>
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
                className="w-full rounded-lg border border-white/[0.08] bg-[#0a0a0a] px-3.5 py-2.5 text-[13px] text-white outline-none transition placeholder:text-white/25 focus:border-white/20"
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
                className="w-full rounded-lg border border-white/[0.08] bg-[#0a0a0a] px-3.5 py-2.5 text-[13px] text-white outline-none transition placeholder:text-white/25 focus:border-white/20"
              />
            </div>

            {error || oauthError ? (
              <p className="text-[12px] text-red-300">{error || oauthError}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-[13px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
            >
              {loading ? "Aguarde…" : "Continuar"}
            </button>
          </form>
        </div>

        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--fg-muted)]">
          <span>© {new Date().getFullYear()} Hollow</span>
          <Link href="/suporte" className="hover:text-white">
            Termos
          </Link>
          <Link href="/suporte" className="hover:text-white">
            Privacidade
          </Link>
        </footer>
      </section>

      <aside className="relative hidden overflow-hidden border-l border-white/[0.06] bg-[#050505] lg:flex lg:items-center lg:justify-center lg:px-10 lg:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(139,92,246,0.14),transparent_48%)]"
        />

        <div className="relative w-full max-w-[480px]">
          <div className="mb-5 flex justify-center gap-1.5">
            <span className="h-0.5 w-6 rounded-full bg-white/70" />
            <span className="h-0.5 w-6 rounded-full bg-white/15" />
            <span className="h-0.5 w-6 rounded-full bg-white/15" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Pedidos hoje", value: "847", delta: "+8.2%" },
              { label: "Robux", value: "48k", delta: "+12.4%" },
              { label: "Entrega", value: "4 min", delta: "rápido" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-white/[0.06] bg-[#0c0c0c] p-3"
              >
                <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--fg-muted)]">
                  {stat.label}
                </p>
                <p className="mt-2 font-display text-lg font-bold text-white">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[10px] text-[var(--purple-bright)]">
                  ↑ {stat.delta}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-2 rounded-lg border border-white/[0.06] bg-[#0c0c0c] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-white">
                  Atividade Hollow
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--fg-muted)]">
                  Entregas nas últimas 24h
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--purple-bright)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--purple-bright)]" />
                Online
              </span>
            </div>

            <svg
              viewBox="0 0 400 130"
              className="h-32 w-full"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="hollowChartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(139,92,246,0.28)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                </linearGradient>
              </defs>
              <path
                d={`${CHART_POINTS} L400,130 L0,130 Z`}
                fill="url(#hollowChartFill)"
              />
              <path
                d={CHART_POINTS}
                fill="none"
                stroke="var(--purple-bright)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>

            <div className="mt-1 flex justify-between text-[9px] uppercase tracking-[0.1em] text-[var(--fg-muted)]">
              <span>00h</span>
              <span>06h</span>
              <span>12h</span>
              <span>18h</span>
              <span>22h</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
