import type { Metadata } from "next";
import { DashboardClient } from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Acompanhe seus pedidos, gastos e entregas Hollow.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
