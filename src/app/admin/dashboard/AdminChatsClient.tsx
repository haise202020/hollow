"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ChatItem = {
 orderId: string;
 lastMessageAt: string;
 lastSender: string;
 messageCount: number;
 robloxUsername: string | null;
 productLabel: string | null;
 amountBrl: number | null;
 adminStatus: string | null;
 status: string | null;
 createdAt: string;
};

export function AdminChatsClient() {
 const [chats, setChats] = useState<ChatItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 useEffect(() => {
 async function load() {
 try {
 const res = await fetch("/api/admin/chats", { credentials: "include" });
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 setError(data.error ?? "Erro ao carregar chats.");
 return;
 }
 const data = await res.json();
 setChats(data.chats ?? []);
 } catch {
 setError("Erro de rede. Tente novamente.");
 } finally {
 setLoading(false);
 }
 }
 load();

 // Polling a cada 10s para atualizar chats ao vivo
 const interval = setInterval(load, 10000);
 return () => clearInterval(interval);
 }, []);

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

 function getStatusColor(status: string | null) {
 if (status === "APROVADO") return "text-[#c026d3] bg-[#c026d3]/15";
 if (status === "REJEITADO") return "text-red-400 bg-red-400/15";
 return "text-[#ffb700] bg-[#ffb700]/15";
 }

 function getStatusLabel(status: string | null) {
 if (status === "APROVADO") return "Aprovado";
 if (status === "REJEITADO") return "Rejeitado";
 if (status === "AGUARDANDO") return "Pendente";
 return status ?? "—";
 }

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
 <h1 className="text-sm font-medium text-gray-400">Dashboard Admin</h1>
 </div>
 </header>

 <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
 <div className="mb-6 flex items-center justify-between">
 <div>
 <h2 className="font-display text-2xl font-bold text-white">
 Chats de Suporte
 </h2>
 <p className="mt-1 text-sm text-gray-500">
 Acompanhe todas as conversas com clientes em tempo real
 </p>
 </div>
 <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0d0d0d] px-4 py-2">
 <span className="h-2 w-2 animate-pulse rounded-full bg-[#c026d3]" />
 <span className="text-xs font-medium text-gray-400">
 {loading ? "Carregando..." : `${chats.length} conversa${chats.length !== 1 ? "s" : ""}`}
 </span>
 </div>
 </div>

 {error && (
 <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
 {error}
 </div>
 )}

 {!loading && !error && chats.length === 0 && (
 <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0d0d0d]">
 <div className="text-center">
 <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.04]">
 <svg
 className="h-8 w-8 text-gray-500"
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
 <p className="text-sm font-medium text-white">Nenhuma conversa ainda</p>
 <p className="mt-1 text-xs text-gray-500">
 As conversas aparecerão aqui quando clientes iniciarem contato
 </p>
 </div>
 </div>
 )}

 {chats.length > 0 && (
 <div className="grid gap-4">
 {chats.map((chat) => (
 <Link
 key={chat.orderId}
 href={`/chat/${chat.orderId}`}
 className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-5 transition-all hover:border-[#c026d3]/40 hover:bg-[#121218]"
 >
 <div className="flex items-start justify-between gap-4">
 {/* Info do Pedido */}
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c026d3]/15 text-[#c026d3]">
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
 d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
 />
 </svg>
 </div>
 <div className="min-w-0">
 <p className="truncate text-sm font-semibold text-white">
 {chat.robloxUsername ? `@${chat.robloxUsername}` : "Usuário desconhecido"}
 </p>
 <p className="truncate text-xs text-gray-500">
 {chat.productLabel ?? "Produto não especificado"} •{" "}
 R${" "}
 {chat.amountBrl?.toLocaleString("pt-BR", {
 minimumFractionDigits: 2,
 }) ?? "—"}
 </p>
 </div>
 </div>

 <div className="mt-3 flex flex-wrap items-center gap-2">
 <span
 className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusColor(chat.adminStatus)}`}
 >
 {getStatusLabel(chat.adminStatus)}
 </span>
 <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-gray-400">
 {chat.messageCount} mensagem{chat.messageCount !== 1 ? "s" : ""}
 </span>
 <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-gray-400">
 Última: {formatDate(chat.lastMessageAt)}
 </span>
 </div>
 </div>

 {/* Indicador de última ação */}
 <div className="flex flex-col items-end gap-1">
 <span
 className={`text-xs font-medium ${
 chat.lastSender === "customer"
 ? "text-[#c026d3]"
 : "text-gray-500"
 }`}
 >
 {chat.lastSender === "customer"
 ? "Cliente falou por último"
 : "Admin respondeu"}
 </span>
 <svg
 className="h-5 w-5 text-gray-600 transition group-hover:text-[#c026d3] group-hover:translate-x-1"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 strokeWidth={2}
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M9 5l7 7-7 7"
 />
 </svg>
 </div>
 </div>

 {/* ID do pedido */}
 <div className="mt-3 border-t border-white/[0.06] pt-3">
 <p className="font-mono text-[10px] text-gray-600">
 #{chat.orderId}
 </p>
 </div>
 </Link>
 ))}
 </div>
 )}
 </main>
 </div>
 );
}