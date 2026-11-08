import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatClient } from "./ChatClient";
import { getOrder } from "@/lib/orders/store";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Chat do Pedido | Hollow",
  description: "Converse com a equipe Hollow sobre seu pedido.",
};

export default async function ChatPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#060609] text-sm text-[var(--fg-muted)]">
          Carregando chat…
        </div>
      }
    >
      <ChatClient orderId={orderId} />
    </Suspense>
  );
}