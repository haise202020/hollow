import type { Metadata } from "next";
import { FaturasClient } from "@/components/FaturasClient";

export const metadata: Metadata = {
  title: "Faturas",
  description: "Veja quanto você já gastou na Hollow.",
};

export default function FaturasPage() {
  return <FaturasClient />;
}
