"use client";

import Link from "next/link";
import {
  AccountShell,
  TONE_STYLES,
  useAccountData,
} from "@/components/account/useAccountData";

const CHART =
  "M0,110 C40,104 70,96 100,84 C140,66 165,74 200,54 C240,32 270,40 310,24 C350,10 375,16 400,8";

export function DashboardClient() {
  const { user, stats, orders, error, loading } = useAccountData(5000);
  const recent = orders.slice(0, 5);

  if (loading) {
    return (
      <div className="site-container py-16 text-sm text-[var(--fg-muted)]">
        Carregando dashboard…
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
      eyebrow="Dashboard"
      title={`Olá, ${user?.displayName || user?.username}`}
      subtitle="Resumo da sua conta Hollow — gastos, entregas e pedidos recentes."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/robux"
          className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-bright)]"
        >
          Comprar Robux
        </Link>
        <Link
          href="/compras"
          className="rounded-xl border border-white/12 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/25"
        >
          Minhas compras
        </Link>
        <Link
          href="/faturas"
          className="rounded-xl border border-white/12 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/25"
        >
          Faturas
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total gasto",
            value: stats?.totalSpentFormatted ?? "R$ 0,00",
            hint: "Pedidos pagos",
          },
          {
            label: "Robux",
            value: (stats?.totalRobux ?? 0).toLocaleString("pt-BR"),
            hint: "Já entregues / pagos",
          },
          {
            label: "Pendentes",
            value: String(stats?.pendingOrders ?? 0),
            hint: "Aguardando entrega",
          },
          {
            label: "Entregues",
            value: String(stats?.deliveredOrders ?? 0),
            hint: "Aprovados",
          },
        ].map((card, index) => (
          <div
            key={card.label}
            style={{ animationDelay: `${0.06 * index}s` }}
            className="animate-rise rounded-2xl border border-white/[0.08] bg-[#0c0a14]/80 p-5 backdrop-blur-md transition hover:border-[var(--accent)]/30"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--fg-muted)]">
              {card.label}
            </p>
            <p className="mt-3 font-display text-2xl font-bold text-white">
              {card.value}
            </p>
            <p className="mt-2 text-xs text-[var(--accent-bright)]">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0a14]/80 p-5 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-white">
                Atividade recente
              </p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Ticket médio {stats?.averageTicketFormatted ?? "R$ 0,00"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-bright)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-bright)]" />
              Conta ativa
            </span>
          </div>
          <svg
            viewBox="0 0 400 120"
            className="h-28 w-full"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="dashFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(139,92,246,0.3)" />
                <stop offset="100%" stopColor="rgba(139,92,246,0)" />
              </linearGradient>
            </defs>
            <path d={`${CHART} L400,120 L0,120 Z`} fill="url(#dashFill)" />
            <path
              d={CHART}
              fill="none"
              stroke="var(--accent-bright)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0a14]/80 p-5 backdrop-blur-md">
          <p className="font-display text-lg font-semibold text-white">Atalhos</p>
          <div className="mt-4 space-y-2">
            {[
              { href: "/perfil", label: "Perfil e senha" },
              { href: "/faturas", label: "Ver faturas" },
              { href: "/compras", label: "Pedidos pendentes" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-sm text-white transition hover:border-[var(--accent)]/35"
              >
                {item.label}
                <span className="text-[var(--fg-muted)]">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-white">
            Últimos pedidos
          </h2>
          <Link
            href="/compras"
            className="text-sm text-[var(--accent-bright)] hover:text-white"
          >
            Ver todos
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0a14]/80 px-6 py-10 text-center backdrop-blur-md">
            <p className="text-white">Nenhum pedido ainda</p>
            <Link
              href="/robux"
              className="mt-4 inline-flex rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/30"
            >
              Ir para Robux
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((order) => (
              <article
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0c0a14]/80 px-5 py-4 backdrop-blur-md"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-base font-semibold text-white">
                      {order.productLabel}
                    </p>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${TONE_STYLES[order.statusTone]}`}
                    >
                      {order.deliveryLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--fg-muted)]">
                    {order.createdAtFormatted} · @{order.robloxUsername}
                  </p>
                </div>
                <p className="font-display text-base font-bold text-white">
                  {order.amountFormatted}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </AccountShell>
  );
}
