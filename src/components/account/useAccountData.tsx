"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type StatusTone = "pending" | "approved" | "rejected" | "paid" | "failed";

export type AccountOrder = {
  id: string;
  type: "robux" | "gamepass";
  productLabel: string;
  amountFormatted: string;
  amountBrl: number;
  robuxAmount: number | null;
  robloxUsername: string;
  robloxGamepassId: number | null;
  gamepassId: string | null;
  deliveryLabel: string;
  statusTone: StatusTone;
  pending: boolean;
  createdAt: string;
  createdAtFormatted: string;
};

export type AccountStats = {
  pendingOrders: number;
  deliveredOrders: number;
  totalOrders: number;
  totalSpentFormatted: string;
  totalSpentBrl: number;
  totalRobux: number;
  averageTicketFormatted: string;
};

export type AccountUser = {
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  hasPassword?: boolean;
  discordId?: string | null;
};

export const TONE_STYLES: Record<StatusTone, string> = {
  pending: "border-amber-400/25 bg-amber-500/10 text-amber-200",
  paid: "border-sky-400/25 bg-sky-500/10 text-sky-200",
  approved: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
  rejected: "border-red-400/25 bg-red-500/10 text-red-200",
  failed: "border-red-400/25 bg-red-500/10 text-red-200",
};

export function useAccountData(pollMs = 0) {
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [stats, setStats] = useState<AccountStats | null>(null);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      const data = (await response.json()) as {
        user?: AccountUser;
        stats?: AccountStats;
        orders?: AccountOrder[];
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Falha ao carregar dados.");
        return;
      }
      setUser(data.user ?? null);
      setStats(data.stats ?? null);
      setOrders(data.orders ?? []);
      setError("");
    } catch {
      setError("Falha de rede ao carregar.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
    if (!pollMs) return;
    const timer = window.setInterval(() => {
      void load();
    }, pollMs);
    return () => window.clearInterval(timer);
  }, [load, pollMs]);

  return { user, stats, orders, error, loading, reload: load };
}

export function AccountShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="site-container py-10 md:py-14">
      <div className="animate-rise">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--purple-bright)]">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-xl text-sm text-[var(--fg-muted)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="mt-8 animate-rise-delay">{children}</div>
    </div>
  );
}
