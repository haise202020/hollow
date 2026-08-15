import type { Metadata } from "next";
import { RobuxSlider } from "@/components/RobuxSlider";

export const metadata: Metadata = {
  title: "Robux",
  description:
    "Escolha a quantidade de Robux e veja o valor na hora. Melhor preço do Brasil na Hollow.",
};

export default function RobuxPage() {
  return (
    <div className="site-container pb-14 pt-8 md:pb-16 md:pt-10">
      <div className="max-w-2xl animate-rise">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--purple-bright)]">
          Robux
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
          Escolha quantos Robux você quer
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--fg-muted)] md:text-base">
          Arraste a barra para definir a quantidade. O valor atualiza na hora —
          1.000 Robux saem por R$ 38,00.
        </p>
      </div>

      <div className="mt-8 md:mt-10">
        <RobuxSlider />
      </div>
    </div>
  );
}
