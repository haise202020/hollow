"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const lastMessageIdsRef = useRef<string>("");

  useEffect(() => {
    async function load() {
      try {
        const [msgRes, orderRes] = await Promise.all([
          fetch(`/api/chat/${orderId}`, { credentials: "include" }),
          fetch(`/api/checkout/status?orderId=${orderId}`, { credentials: "include" }),
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

  // Só faz scroll automático dentro do container do chat quando há novas mensagens
  // e o usuário já estava perto do fundo. Usa scrollTop para não mover a página inteira.
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
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
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

  const statusColor =
    order?.adminStatus === "APROVADO"
      ? "text-[#c026d3]"
      : order?.adminStatus === "REJEITADO"
        ? "text-red-400"
        : "text-[#ffb700]";

  const statusDotColor =
    order?.adminStatus === "APROVADO"
      ? "bg-[#c026d3]"
      : order?.adminStatus === "REJEITADO"
        ? "bg-red-400"
        : "bg-[#ffb700]";

  const attendanceColor = "text-[#c026d3]";
  const attendanceDotColor = "bg-[#c026d3]";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#0a0a0a] px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight text-white transition hover:text-[#c026d3]"
          >
            hollow
          </Link>
          <h1 className="text-sm font-medium text-gray-400">Meu Pedido</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Coluna Esquerda — Resumo do Pedido */}
          <aside className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0d]">
              <div className="border-b border-white/[0.08] px-5 py-4">
                <h2 className="font-display text-base font-semibold text-white">
                  Resumo do Pedido
                </h2>
                <p className="mt-1 font-mono text-xs text-gray-500">
                  #{orderId}
                </p>
              </div>

              <div className="divide-y divide-white/[0.06] px-5">
                {/* Atendimento */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs text-gray-500">Atendimento</span>
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${attendanceColor}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${attendanceDotColor}`} />
                    Em atendimento
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${statusColor}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDotColor}`} />
                    {order?.adminStatus === "AGUARDANDO" ? "Pendente" : (order?.adminStatus ?? "—")}
                  </span>
                </div>

                {/* Itens */}
                <div className="py-3">
                  <span className="text-xs text-gray-500">Itens</span>
                  <div className="mt-2 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#c026d3]/15 text-[#c026d3]">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {order?.productLabel ?? "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        R${" "}
                        {order?.amountBrl?.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        }) ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Usuário Roblox */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs text-gray-500">Usuário Roblox</span>
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a1a2e] text-[10px] font-bold text-[#c026d3]">
                      {order?.robloxUsername?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="text-xs font-medium text-white">
                      {order?.robloxUsername ?? "—"}
                    </span>
                  </div>
                </div>

                {/* Link da Gamepass */}
                {order?.robloxGamepassId && (
                  <div className="py-3">
                    <span className="text-xs text-gray-500">Link do Gamepass</span>
                    <a
                      href={`https://www.roblox.com/game-pass/${order.robloxGamepassId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block truncate text-xs font-medium text-[#c026d3] transition hover:text-[#a855f7]"
                    >
                      https://www.roblox.com/game-pass/{order.robloxGamepassId}
                    </a>
                  </div>
                )}

                {/* Data */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs text-gray-500">Data</span>
                  <span className="text-xs text-white">
                    {order ? formatDate(order.createdAt) : "—"}
                  </span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs font-medium text-gray-400">Total</span>
                  <span className="text-sm font-bold text-white">
                    R${" "}
                    {order?.amountBrl?.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    }) ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] leading-relaxed text-gray-500">
              Suas informações estão protegidas. Apenas nossa equipe tem acesso
              a este chat.
            </p>
          </aside>

          {/* Coluna Direita — Chat */}
          <section className="flex min-h-[600px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0d]">
            {/* Header do Chat */}
            <div className="border-b border-white/[0.08] px-6 py-4">
              <h2 className="font-display text-base font-semibold text-white">
                Chat de suporte
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Respondemos em poucos minutos
              </p>
            </div>

            {/* Mensagens */}
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {messages.length === 0 && !error && (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  Nenhuma mensagem ainda. Envie a primeira!
                </div>
              )}

              {messages.map((msg) => {
                const isAdmin = msg.sender === "admin";
                const isSystem = msg.sender === "system" || msg.isAutoMessage;
                const isCustomer = msg.sender === "customer";

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isCustomer ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isCustomer
                          ? "bg-white/[0.08] text-gray-400"
                          : "bg-[#1a1a2e] text-[#c026d3]"
                      }`}
                    >
                      {isCustomer
                        ? (order?.robloxUsername?.[0]?.toUpperCase() ?? "U")
                        : (msg.senderName?.[0]?.toUpperCase() ?? "E")}
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[80%] space-y-1 ${isCustomer ? "items-end text-right" : "items-start"}`}>
                      <div className={`flex items-center gap-2 ${isCustomer ? "flex-row-reverse" : ""}`}>
                        <span className="text-xs font-medium text-white">
                          {msg.senderName}
                        </span>
                        {isSystem && (
                          <span className="rounded bg-[#ffb700]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#ffb700]">
                            Mensagem automática
                          </span>
                        )}
                      </div>

                      <div
                        className={`rounded-xl px-4 py-3 text-left text-sm leading-relaxed ${
                          isCustomer
                            ? "bg-[#c026d3] text-white"
                            : "border border-white/[0.08] bg-[#1a1a1a] text-white"
                        }`}
                      >
                        {msg.content}
                      </div>

                      <span className={`text-[10px] text-gray-500 ${isCustomer ? "text-right" : ""}`}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="border-t border-white/[0.08] px-6 py-4">
              {error && <p className="mb-3 text-xs text-red-400">{error}</p>}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem…"
                  maxLength={2000}
                  className="flex-1 rounded-xl border border-white/[0.08] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-[#c026d3] focus:ring-1 focus:ring-[#c026d3]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="rounded-xl bg-[#c026d3] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a855f7] hover:shadow-[0_0_16px_rgba(192,38,211,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? "…" : "Enviar"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}