import type { Metadata } from "next";
import { ComprasClient } from "@/components/ComprasClient";

export const metadata: Metadata = {
  title: "Minhas compras",
  description: "Acompanhe pedidos pendentes e compras anteriores na Hollow.",
};

export default function ComprasPage() {
  return <ComprasClient />;
}
