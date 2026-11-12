"use client";

import Link from "next/link";
import {
  AccountShell,
  TONE_STYLES,
  useAccountData,
} from "@/components/account/useAccountData";

export function FaturasClient() {
  const { stats, orders, error, loading } = useAccountData();
  const invoices = orders.filter(
    (order) =>
      order.statusTone === "approved" ||
      order.statusTone === "paid" ||
      order.amountBrl > 0,
  );

  if (loading) {
    return (
      <div className="site-container py-16 text-sm text-[var(--fg-muted)]">
        Carregando faturas…
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
      eyebrow="Faturas"
      title="Seus gastos"
      subtitle="Veja quanto você já gastou e o histórico de cobranças."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Total gasto",
            value: stats?.totalSpentFormatted ?? "R$ 0,00",
          },
          {
            label: "Ticket médio",
            value: stats?.averageTicketFormatted ?? "R$ 0,00",
          },
          {
            label: "Pedidos",
            value: String(stats?.totalOrders ?? 0),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border-none bg-[#0c0a14]/80 p-5 backdrop-blur-md"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--fg-muted)]">
              {card.label}
            </p>
            <p className="mt-3 font-display text-2xl font-bold text-white">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-xl font-bold text-white">
          Histórico
        </h2>
        {invoices.length === 0 ? (
          <div className="rounded-2xl border-none bg-[#0c0a14]/80 px-6 py-10 text-center backdrop-blur-md">
            <p className="text-white">Nenhuma fatura ainda</p>
            <Link
              href="/robux"
              className="mt-4 inline-flex rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Fazer primeira compra
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border-none bg-[#0c0a14]/80 backdrop-blur-md">
            <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.7fr] gap-3 border-b border-white/[0.06] px-5 py-3 text-[11px] uppercase tracking-[0.12em] text-[var(--fg-muted)] sm:grid">
              <span>Produto</span>
              <span>Data</span>
              <span>Status</span>
              <span className="text-right">Valor</span>
            </div>
            {invoices.map((order) => (
              <div
                key={order.id}
                className="grid gap-2 border-b border-white/[0.04] px-5 py-4 last:border-b-0 sm:grid-cols-[1.4fr_1fr_0.8fr_0.7fr] sm:items-center sm:gap-3"
              >
                <div>
                  <p className="font-medium text-white">{order.productLabel}</p>
                  <p className="mt-0.5 text-xs text-[var(--fg-muted)] sm:hidden">
                    {order.createdAtFormatted}
                  </p>
                </div>
                <p className="hidden text-sm text-[var(--fg-muted)] sm:block">
                  {order.createdAtFormatted}
                </p>
                <span
                  className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${TONE_STYLES[order.statusTone]}`}
                >
                  {order.deliveryLabel}
                </span>
                <p className="font-display text-base font-bold text-white sm:text-right">
                  {order.amountFormatted}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </AccountShell>
  );
}
