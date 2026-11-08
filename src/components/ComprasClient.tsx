"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AccountShell,
  TONE_STYLES,
  useAccountData,
} from "@/components/account/useAccountData";

type Tab = "pendentes" | "anteriores";

export function ComprasClient() {
  const { orders, error, loading } = useAccountData(4000);
  const [tab, setTab] = useState<Tab>("pendentes");

  const pending = useMemo(
    () => orders.filter((order) => order.pending),
    [orders],
  );
  const previous = useMemo(
    () => orders.filter((order) => !order.pending),
    [orders],
  );
  const list = tab === "pendentes" ? pending : previous;

  if (loading) {
    return (
      <div className="site-container py-16 text-sm text-[var(--fg-muted)]">
        Carregando compras…
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
      eyebrow="Compras"
      title="Minhas compras"
      subtitle="Acompanhe o que está pendente de entrega e o que você já comprou."
    >
      <div className="mb-6 inline-flex rounded-full border border-white/[0.08] bg-[#0c0c10] p-1">
        {(
          [
            { id: "pendentes", label: `Pendentes (${pending.length})` },
            { id: "anteriores", label: `Anteriores (${previous.length})` },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === item.id
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--fg-muted)] hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c10] px-6 py-12 text-center">
          <p className="text-white">
            {tab === "pendentes"
              ? "Nenhuma compra pendente"
              : "Nenhuma compra anterior"}
          </p>
          <Link
            href="/robux"
            className="mt-4 inline-flex rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Comprar Robux
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((order) => {
            const gamepassRef =
              order.robloxGamepassId != null
                ? String(order.robloxGamepassId)
                : order.gamepassId;

            return (
              <article
                key={order.id}
                className="rounded-2xl border border-white/[0.06] bg-[#0c0c10] p-5 transition hover:border-[var(--accent)]/25"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold text-white">
                        {order.productLabel}
                      </h3>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${TONE_STYLES[order.statusTone]}`}
                      >
                        {order.deliveryLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--fg-muted)]">
                      {order.createdAtFormatted}
                    </p>
                  </div>
                  <p className="font-display text-xl font-bold text-white">
                    {order.amountFormatted}
                  </p>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-[var(--fg-muted)] sm:grid-cols-3">
                  <p>
                    Nick:{" "}
                    <span className="text-white">@{order.robloxUsername}</span>
                  </p>
                  <p>
                    Robux:{" "}
                    <span className="text-white">
                      {order.robuxAmount
                        ? order.robuxAmount.toLocaleString("pt-BR")
                        : "—"}
                    </span>
                  </p>
                  <p>
                    Gamepass:{" "}
                    <span className="text-white">{gamepassRef || "—"}</span>
                  </p>
                </div>

                <div className="mt-4 flex justify-end border-t border-white/[0.06] pt-4">
                  <Link
                    href={`/chat/${order.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)]/15 px-4 py-2 text-xs font-semibold text-[var(--accent-bright)] transition hover:bg-[var(--accent)] hover:text-white"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Conversar com suporte
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AccountShell>
  );
}
