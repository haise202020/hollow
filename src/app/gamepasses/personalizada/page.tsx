import type { Metadata } from "next";
import Link from "next/link";
import { CustomGamepassForm } from "@/components/CustomGamepassForm";

export const metadata: Metadata = {
  title: "Gamepass personalizada",
  description:
    "Não encontrou a gamepass? Peça manualmente e pague via Pix na Hollow.",
};

export default function CustomGamepassPage() {
  return (
    <div className="gamepasses-page-bg">
      <div className="relative z-10 mx-auto w-[min(900px,calc(100%-1.5rem))] py-10 md:py-14">
        <Link
          href="/gamepasses"
          className="mb-6 inline-flex text-sm text-[var(--fg-muted)] transition hover:text-white"
        >
          ← Voltar para gamepasses
        </Link>

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent-bright)]">
            Pedido personalizado
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
            Não achou a gamepass?
          </h1>
          <p className="mt-3 text-sm text-[var(--fg-muted)] md:text-base">
            Informe o jogo, o nome da gamepass e o valor. Depois geramos o Pix
            automaticamente para você pagar.
          </p>
        </div>

        <div className="mt-8">
          <CustomGamepassForm />
        </div>
      </div>
    </div>
  );
}
