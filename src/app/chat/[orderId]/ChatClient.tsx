"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ChatMessage } from "@/lib/chat/types";

type OrderSummary = {
  id: string;
  status: string;
  adminStatus: string;
  productLabel: string;
  amountBrl: number;
  robloxUsername: string;
  robloxGamepassId?: number | null;
  createdAt: string;
};

export function ChatClient({ orderId }: { orderId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const lastMessageIdsRef = useRef<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  useEffect(() => {
    async function load() {
      try {
        const [msgRes, orderRes] = await Promise.all([
          fetch(`/api/chat/${orderId}`, { credentials: "include" }),
          fetch(`/api/checkout/status?orderId=${orderId}`, {
            credentials: "include",
          }),
        ]);

        if (msgRes.ok) {
          const data = await msgRes.json();
          setMessages(data.messages ?? []);
        }

        if (orderRes.ok) {
          const data = await orderRes.json();
          setOrder(data.order ?? null);
        }
      } catch {
        setError("Não foi possível carregar o chat.");
      }
    }
    load();

    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Detecta se o usuário está próximo do final do scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    function handleScroll() {
      if (!container) return;
      const threshold = 150;
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      isNearBottomRef.current = distanceFromBottom < threshold;
    }

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll automático apenas dentro do container quando há novas mensagens
  useEffect(() => {
    const ids = messages.map((m) => m.id).join(",");
    if (ids === lastMessageIdsRef.current) return;
    lastMessageIdsRef.current = ids;

    if (!isNearBottomRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [messages]);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch(`/api/chat/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Falha ao enviar mensagem.");
        return;
      }

      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    return isToday
      ? `Hoje às ${formatTime(iso)}`
      : d.toLocaleDateString("pt-BR") + ` às ${formatTime(iso)}`;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(e as unknown as FormEvent);
    }
  }

  const statusConfig = {
    APROVADO: {
      label: "Aprovado",
      color: "text-emerald-400",
      dot: "bg-emerald-400",
      bg: "bg-emerald-400/10",
    },
    REJEITADO: {
      label: "Rejeitado",
      color: "text-red-400",
      dot: "bg-red-400",
      bg: "bg-red-400/10",
    },
    AGUARDANDO: {
      label: "Pendente",
      color: "text-amber-400",
      dot: "bg-amber-400",
      bg: "bg-amber-400/10",
    },
  };

  const currentStatus =
    statusConfig[
      (order?.adminStatus as keyof typeof statusConfig) ?? "AGUARDANDO"
    ] ?? statusConfig.AGUARDANDO;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-white">
      {/* Header — consistente com o resto do site */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07070a]/95 backdrop-blur-xl">
        <div className="site-container flex h-[72px] items-center justify-between">
          <Link
            href="/"
            className="flex items-center transition opacity-90 hover:opacity-100"
          >
            <Image
              src="/logo.png"
              alt="Hollow"
              width={36}
              height={36}
              priority
              className="h-9 w-auto"
            />
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[var(--fg-muted)] sm:inline">
              Pedido #{orderId.slice(4, 12)}
            </span>
            <Link
              href="/"
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white transition hover:border-[var(--accent)]/50 hover:bg-white/[0.06]"
            >
              Voltar
            </Link>
          </div>
        </div>
      </header>

      <main className="site-container flex-1 py-6 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Sidebar — Resumo do Pedido */}
          <aside className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--bg-elevated)]">
              {/* Header do card */}
              <div className="border-b border-white/[0.06] px-5 py-4">
                <h2 className="font-display text-sm font-semibold text-white">
                  Resumo do Pedido
                </h2>
                <p className="mt-0.5 font-mono text-[11px] text-[var(--fg-muted)]">
                  {orderId}
                </p>
              </div>

              <div className="divide-y divide-white/[0.06] px-5">
                {/* Status badge */}
                <div className="flex items-center justify-between py-3.5">
                  <span className="text-xs text-[var(--fg-muted)]">Status</span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${currentStatus.color} ${currentStatus.bg}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot}`}
                    />
                    {currentStatus.label}
                  </span>
                </div>

                {/* Produto */}
                <div className="py-3.5">
                  <span className="text-xs text-[var(--fg-muted)]">Produto</span>
                  <div className="mt-2 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {order?.productLabel ?? "—"}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--accent-bright)]">
                        R${" "}
                        {order?.amountBrl?.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        }) ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Usuário Roblox */}
                <div className="flex items-center justify-between py-3.5">
                  <span className="text-xs text-[var(--fg-muted)]">
                    Conta Roblox
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[10px] font-bold text-[var(--accent)]">
                      {order?.robloxUsername?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="text-xs font-medium text-white">
                      {order?.robloxUsername ?? "—"}
                    </span>
                  </div>
                </div>

                {/* Gamepass link */}
                {order?.robloxGamepassId && (
                  <div className="py-3.5">
                    <span className="text-xs text-[var(--fg-muted)]">
                      Gamepass
                    </span>
                    <a
                      href={`https://www.roblox.com/game-pass/${order.robloxGamepassId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block truncate text-xs font-medium text-[var(--accent)] transition hover:text-[var(--accent-bright)]"
                    >
                      Ver no Roblox ↗
                    </a>
                  </div>
                )}

                {/* Data */}
                <div className="flex items-center justify-between py-3.5">
                  <span className="text-xs text-[var(--fg-muted)]">Data</span>
                  <span className="text-xs text-white">
                    {order ? formatDate(order.createdAt) : "—"}
                  </span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between py-3.5">
                  <span className="text-xs font-medium text-[var(--fg-muted)]">
                    Total pago
                  </span>
                  <span className="text-sm font-bold text-white">
                    R${" "}
                    {order?.amountBrl?.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    }) ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Info de segurança */}
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3">
              <div className="flex items-start gap-2.5">
                <svg
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--fg-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <p className="text-[11px] leading-relaxed text-[var(--fg-muted)]">
                  Suas informações estão protegidas. Apenas a equipe Hollow tem
                  acesso a este chat.
                </p>
              </div>
            </div>
          </aside>

          {/* Chat principal */}
          <section className="flex min-h-[calc(100vh-180px)] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--bg-elevated)]">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div>
                <h2 className="font-display text-base font-semibold text-white">
                  Chat de suporte
                </h2>
                <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                  Respondemos em poucos minutos
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-medium text-emerald-400">
                  Online
                </span>
              </div>
            </div>

            {/* Área de mensagens */}
            <div
              ref={scrollContainerRef}
              className="flex-1 space-y-5 overflow-y-auto px-6 py-6"
            >
              {messages.length === 0 && !error && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04]">
                    <svg
                      className="h-5 w-5 text-[var(--fg-muted)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-[var(--fg-muted)]">
                    Nenhuma mensagem ainda.
                    <br />
                    Envie a primeira para iniciar o atendimento.
                  </p>
                </div>
              )}

              {messages.map((msg) => {
                const isSystem = msg.sender === "system" || msg.isAutoMessage;
                const isCustomer = msg.sender === "customer";

                // Mensagens de sistema são centralizadas
                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center py-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] text-[var(--fg-muted)]">
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isCustomer ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        isCustomer
                          ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                          : "bg-white/[0.06] text-white"
                      }`}
                    >
                      {isCustomer
                        ? (order?.robloxUsername?.[0]?.toUpperCase() ?? "U")
                        : (msg.senderName?.[0]?.toUpperCase() ?? "E")}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[75%] space-y-1 ${isCustomer ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`flex items-center gap-2 ${isCustomer ? "flex-row-reverse" : ""}`}
                      >
                        <span className="text-[11px] font-medium text-[var(--fg-muted)]">
                          {msg.senderName}
                        </span>
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isCustomer
                            ? "rounded-tr-md bg-[var(--accent)] text-white"
                            : "rounded-tl-md border border-white/[0.06] bg-[var(--bg-panel)] text-white"
                        }`}
                      >
                        {msg.content}
                      </div>

                      <span className="text-[10px] text-[var(--fg-muted)]">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input area */}
            <form
              onSubmit={sendMessage}
              className="border-t border-white/[0.06] p-4"
            >
              {error && (
                <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}
              <div className="flex items-end gap-3">
                <div className="relative flex-1">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem…"
                    maxLength={2000}
                    rows={1}
                    className="w-full resize-none rounded-xl border border-white/[0.08] bg-[var(--bg-panel)] px-4 py-3 pr-4 text-sm text-white placeholder-[var(--fg-muted)] outline-none transition focus:border-[var(--accent)]/50 focus:shadow-[0_0_0_3px_var(--accent-glow)]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-white transition hover:bg-[var(--accent-bright)] hover:shadow-[0_0_20px_var(--accent-glow)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {sending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-[var(--fg-muted)]">
                Pressione Enter para enviar · Shift+Enter para nova linha
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}