"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
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

/* ─── Ícones SVG inline (fiéis à referência) ─── */
function IconBag({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function IconCube({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function IconCoins({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconAlertCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function IconChatBubble({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function IconSend({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

function IconInfo({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

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
    <div className="flex min-h-screen flex-col bg-[#05030e] text-white">
      <div className="relative flex-1 overflow-x-hidden">
        <main className="site-container relative py-8 md:py-12">
          <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:gap-8">
            {/* ═══════════════════════════════════════
                COLUNA ESQUERDA — Resumo do Pedido
            ═══════════════════════════════════════ */}
            <aside className="space-y-4">
              {/* Card: Resumo do Pedido */}
              <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0a14]/90 backdrop-blur-md">
                {/* Header do card */}
                <div className="border-b border-white/[0.06] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
                      <IconBag className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-sm font-semibold text-white">
                        Resumo do Pedido
                      </h2>
                      <p className="mt-0.5 font-mono text-[10px] text-[var(--fg-muted)]">
                        {orderId}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-white/[0.06] px-5">
                  {/* Status */}
                  <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-2.5">
                      <IconAlertCircle className="h-4 w-4 text-[var(--fg-muted)]" />
                      <span className="text-sm text-[var(--fg-muted)]">Status</span>
                    </div>
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
                    <div className="flex items-center gap-2.5">
                      <IconCube className="h-4 w-4 text-[var(--fg-muted)]" />
                      <span className="text-sm text-[var(--fg-muted)]">Produto</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
                        <IconCube className="h-5 w-5" />
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

                  {/* Conta Roblox */}
                  <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-2.5">
                      <IconUser className="h-4 w-4 text-[var(--fg-muted)]" />
                      <span className="text-sm text-[var(--fg-muted)]">Conta Roblox</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[10px] font-bold text-[var(--accent)]">
                        {order?.robloxUsername?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <span className="text-sm font-medium text-white">
                        {order?.robloxUsername ?? "—"}
                      </span>
                    </div>
                  </div>

                  {/* Gamepass link */}
                  {order?.robloxGamepassId && (
                    <div className="py-3.5">
                      <a
                        href={`https://www.roblox.com/game-pass/${order.robloxGamepassId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-[var(--accent)] transition hover:text-[var(--accent-bright)]"
                      >
                        Ver gamepass no Roblox ↗
                      </a>
                    </div>
                  )}

                  {/* Data */}
                  <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-2.5">
                      <IconCalendar className="h-4 w-4 text-[var(--fg-muted)]" />
                      <span className="text-sm text-[var(--fg-muted)]">Data</span>
                    </div>
                    <span className="text-sm text-white">
                      {order ? formatDate(order.createdAt) : "—"}
                    </span>
                  </div>

                  {/* Total pago — destaque roxo */}
                  <div className="flex items-center justify-between rounded-xl bg-[var(--accent)]/10 px-4 py-3.5 my-3.5">
                    <div className="flex items-center gap-2.5">
                      <IconCoins className="h-4 w-4 text-[var(--accent)]" />
                      <span className="text-sm font-medium text-[var(--fg-muted)]">
                        Total pago
                      </span>
                    </div>
                    <span className="text-base font-bold text-white">
                      R${" "}
                      {order?.amountBrl?.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      }) ?? "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card: Privacidade */}
              <div className="rounded-2xl border border-white/[0.06] bg-[#0c0a14]/90 px-5 py-4 backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <IconLock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--fg-muted)]" />
                  <p className="text-xs leading-relaxed text-[var(--fg-muted)]">
                    Suas informações estão protegidas. Apenas a equipe Hollow tem
                    acesso a este chat.
                  </p>
                </div>
              </div>
            </aside>

            {/* ═══════════════════════════════════════
                COLUNA DIREITA — Chat de suporte
            ═══════════════════════════════════════ */}
            <section className="flex min-h-[calc(100vh-200px)] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0a14]/90 backdrop-blur-md">
              {/* Chat header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
                    <IconChatBubble className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-semibold text-white">
                      Chat de suporte
                    </h2>
                    <p className="text-xs text-[var(--fg-muted)]">
                      Respondemos em poucos minutos.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
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
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--accent)]/15 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                      <IconChatBubble className="h-7 w-7 text-[var(--accent)]" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">
                        Nenhuma mensagem ainda.
                      </p>
                      <p className="mt-1 text-sm text-[var(--fg-muted)]">
                        Envie a primeira para iniciar o atendimento.
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((msg) => {
                  const isSystem = msg.sender === "system" || msg.isAutoMessage;
                  const isCustomer = msg.sender === "customer";

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center py-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] text-[var(--fg-muted)]">
                          <IconInfo className="h-3 w-3" />
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
                              : "rounded-tl-md border border-white/[0.06] bg-white/[0.04] text-white"
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
                      className="w-full resize-none overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 pr-4 text-sm text-white placeholder-[var(--fg-muted)] outline-none transition focus:border-[var(--accent)]/50 focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] scrollbar-hide"
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
                      <IconSend className="h-5 w-5" />
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
    </div>
  );
}