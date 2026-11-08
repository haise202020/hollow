"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

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
  approved: "border-purple-400/25 bg-purple-500/10 text-purple-200",
  rejected: "border-red-400/25 bg-red-500/10 text-red-200",
  failed: "border-red-400/25 bg-red-500/10 text-red-200",
};

type AccountCache = {
  user: AccountUser | null;
  stats: AccountStats | null;
  orders: AccountOrder[];
  error: string;
  updatedAt: number;
};

let memoryCache: AccountCache | null = null;
let inflight: Promise<AccountCache> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AccountCache | null {
  return memoryCache;
}

function getServerSnapshot(): AccountCache | null {
  return null;
}

async function fetchAccountData(): Promise<AccountCache> {
  const response = await fetch("/api/dashboard", { cache: "no-store" });
  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  const data = (await response.json()) as {
    user?: AccountUser;
    stats?: AccountStats;
    orders?: AccountOrder[];
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error ?? "Falha ao carregar dados.");
  }
  return {
    user: data.user ?? null,
    stats: data.stats ?? null,
    orders: data.orders ?? [],
    error: "",
    updatedAt: Date.now(),
  };
}

async function loadAccountData(force = false): Promise<AccountCache> {
  const freshEnough =
    memoryCache && Date.now() - memoryCache.updatedAt < 8_000 && !force;
  if (freshEnough && memoryCache) return memoryCache;

  if (inflight && !force) return inflight;

  inflight = fetchAccountData()
    .then((next) => {
      memoryCache = next;
      emit();
      return next;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/** Prefetch compartilhado (ex.: ao abrir o menu do usuário). */
export function prefetchAccountData() {
  void loadAccountData(false).catch(() => undefined);
}

export function useAccountData(pollMs = 0) {
  const router = useRouter();
  const cached = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [error, setError] = useState(cached?.error ?? "");
  const [loading, setLoading] = useState(!cached);

  const refresh = useCallback(
    async (force = false) => {
      try {
        const next = await loadAccountData(force);
        setError(next.error);
        setLoading(false);
      } catch (err) {
        if (err instanceof Error && err.message === "UNAUTHORIZED") {
          router.replace("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Falha de rede ao carregar.");
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    void refresh(false);
    if (!pollMs) return;
    const timer = window.setInterval(() => {
      void refresh(true);
    }, pollMs);
    return () => window.clearInterval(timer);
  }, [pollMs, refresh]);

  return {
    user: cached?.user ?? null,
    stats: cached?.stats ?? null,
    orders: cached?.orders ?? [],
    error,
    loading,
    reload: () => refresh(true),
  };
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
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent-bright)]">
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
      <div className="mt-8">{children}</div>
    </div>
  );
}
