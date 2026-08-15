import Link from "next/link";
import { CartIcon, ChatIcon, ShieldIcon } from "./icons";

const steps = [
  {
    step: "01",
    title: "Escolha o produto",
    description:
      "Selecione a quantidade de Robux ou o gamepass do jogo que você quer. O preço aparece na hora.",
    icon: CartIcon,
  },
  {
    step: "02",
    title: "Finalize com segurança",
    description:
      "Confirme o pedido com proteção anti-fraude. A taxa de 30% do Roblox já fica coberta na compra de Robux.",
    icon: ShieldIcon,
  },
  {
    step: "03",
    title: "Receba a entrega",
    description:
      "Entregamos rápido e com suporte humano em português se precisar de qualquer ajuda.",
    icon: ChatIcon,
  },
];

export function HowItWorks() {
  return (
    <section className="site-container py-14 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--purple-bright)]">
          Como funciona
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
          Comprar na Hollow é simples
        </h2>
        <p className="mt-3 text-[var(--fg-muted)]">
          Do pedido à entrega, tudo pensado para ser rápido, claro e seguro.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {steps.map((item) => (
          <article
            key={item.step}
            className="rounded-2xl border border-white/15 bg-transparent p-6 transition duration-200 hover:scale-[1.03]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--purple)]/15 text-[var(--purple-bright)]">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="font-display text-sm font-bold text-white/30">
                {item.step}
              </span>
            </div>
            <h3 className="mt-5 font-display text-xl font-bold text-white">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
              {item.description}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8">
        <Link
          href="/robux"
          className="text-sm font-semibold text-[var(--purple-bright)] transition hover:text-white"
        >
          Começar agora →
        </Link>
      </div>
    </section>
  );
}
