import type { Metadata } from "next";
import { RobuxSlider } from "@/components/RobuxSlider";

export const metadata: Metadata = {
  title: "Robux",
  description:
    "Escolha a quantidade de Robux e veja o valor na hora. Melhor preço do Brasil na Hollow.",
};

export default function RobuxPage() {
  return (
    <div className="site-container pb-14 pt-20 md:pb-16 md:pt-24">
      {/* Header centralizado */}
      <div className="mx-auto max-w-2xl animate-rise text-center">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent-bright)]">
          Robux
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
          Escolha quantos Robux você quer
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--fg-muted)] md:text-base">
          Arraste a barra para definir a quantidade. O valor atualiza na hora —
          1.000 Robux saem por R$ 38,00.
        </p>
      </div>

      {/* Slider centralizado */}
      <div className="mx-auto mt-8 max-w-2xl md:mt-10">
        <RobuxSlider />
      </div>

      {/* Seção de detalhes abaixo do slider */}
      <div className="mx-auto mt-16 max-w-3xl animate-rise-delay">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Taxa inclusa",
              desc: "A taxa de 30% do Roblox já está coberta no valor final. Você não paga nada à parte.",
            },
            {
              title: "Entrega via Gamepass",
              desc: "Você cria uma gamepass com o valor que informamos e recebe seus Robux em minutos.",
            },
            {
              title: "Suporte em português",
              desc: "Dúvidas ou problemas? Nossa equipe responde rápido, sem robôs e em português.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-white/[0.06] bg-[#0c0c10] p-5 transition-colors hover:border-[var(--accent)]/20"
            >
              <h3 className="font-display text-base font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--fg-muted)]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Linha de confiança */}
        <p className="mt-8 text-center text-[13px] leading-relaxed text-[var(--fg-muted)]">
          Mais de{" "}
          <span className="font-semibold text-white">12.000 entregas</span>{" "}
          realizadas · Cotação transparente · Sem senha do Roblox
        </p>
      </div>
    </div>
  );
}
