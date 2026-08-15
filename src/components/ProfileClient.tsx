"use client";

import { FormEvent, useState } from "react";
import {
  AccountShell,
  useAccountData,
} from "@/components/account/useAccountData";
import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/security/constants";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : null;
}

export function ProfileClient() {
  const { user, error, loading } = useAccountData();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setFormError("A confirmação da senha não confere.");
      return;
    }

    setSaving(true);
    try {
      const csrf = readCookie(CSRF_COOKIE);
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { [CSRF_HEADER]: csrf } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFormError(data.error ?? "Não foi possível atualizar a senha.");
        return;
      }
      setSuccess("Senha atualizada com sucesso.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setFormError("Falha de rede. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="site-container py-16 text-sm text-[var(--fg-muted)]">
        Carregando perfil…
      </div>
    );
  }

  if (error) {
    return (
      <div className="site-container py-16">
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      </div>
    );
  }

  return (
    <AccountShell
      eyebrow="Perfil"
      title="Sua conta"
      subtitle="Dados da conta e alteração de senha."
    >
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c10] p-6">
          <div className="flex items-center gap-4">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--purple)]/20 font-display text-xl font-bold text-[var(--purple-bright)]">
                {(user?.displayName || user?.username || "?")
                  .slice(0, 1)
                  .toUpperCase()}
              </span>
            )}
            <div>
              <p className="font-display text-xl font-bold text-white">
                {user?.displayName || user?.username}
              </p>
              <p className="mt-1 text-sm text-[var(--fg-muted)]">
                @{user?.username}
              </p>
            </div>
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-3 border-b border-white/[0.05] pb-3">
              <dt className="text-[var(--fg-muted)]">Tipo de login</dt>
              <dd className="text-white">
                {user?.discordId ? "Discord" : "Usuário e senha"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--fg-muted)]">Senha</dt>
              <dd className="text-white">
                {user?.hasPassword ? "Configurada" : "Não disponível"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c10] p-6">
          <h2 className="font-display text-lg font-semibold text-white">
            Alterar senha
          </h2>
          {!user?.hasPassword ? (
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg-muted)]">
              Sua conta foi criada com Discord e não possui senha. Para mudar
              senha, use uma conta criada com usuário e senha.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-5 space-y-3.5" noValidate>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--fg-muted)]">
                  Senha atual
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#101016] px-4 py-3 text-sm text-white outline-none focus:border-[var(--purple)]/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--fg-muted)]">
                  Nova senha
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#101016] px-4 py-3 text-sm text-white outline-none focus:border-[var(--purple)]/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--fg-muted)]">
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#101016] px-4 py-3 text-sm text-white outline-none focus:border-[var(--purple)]/50"
                />
              </div>

              {formError ? (
                <p className="text-sm text-red-300">{formError}</p>
              ) : null}
              {success ? (
                <p className="text-sm text-emerald-300">{success}</p>
              ) : null}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex rounded-xl bg-[var(--purple)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--purple-bright)] disabled:opacity-60"
              >
                {saving ? "Salvando…" : "Salvar nova senha"}
              </button>
            </form>
          )}
        </div>
      </div>
    </AccountShell>
  );
}
