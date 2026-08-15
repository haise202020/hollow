"use client";

import { FormEvent, useState } from "react";
import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/security/constants";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : null;
}

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
    };

    try {
      const csrf = readCookie(CSRF_COOKIE);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { [CSRF_HEADER]: csrf } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Não foi possível enviar. Tente novamente.");
        return;
      }

      setStatus("ok");
      setMessage(data.message ?? "Mensagem enviada.");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Falha de rede. Verifique sua conexão.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm text-[var(--fg-muted)]">
          Nome
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          className="w-full rounded-xl border border-white/10 bg-[#101016] px-4 py-3 text-sm text-white outline-none ring-[var(--purple)] transition focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-[var(--fg-muted)]">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={120}
          autoComplete="email"
          className="w-full rounded-xl border border-white/10 bg-[#101016] px-4 py-3 text-sm text-white outline-none ring-[var(--purple)] transition focus:ring-2"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm text-[var(--fg-muted)]"
        >
          Mensagem
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={1000}
          rows={5}
          className="w-full resize-y rounded-xl border border-white/10 bg-[#101016] px-4 py-3 text-sm text-white outline-none ring-[var(--purple)] transition focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-xl bg-[var(--purple)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--purple-bright)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Enviando..." : "Enviar mensagem"}
      </button>

      {message ? (
        <p
          className={`text-sm ${
            status === "ok" ? "text-emerald-400" : "text-red-400"
          }`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
