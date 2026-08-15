import Link from "next/link";
import { BasketIcon } from "./icons";

export function HomeCta() {
  return (
    <section className="site-container py-14 md:py-20">
      <div className="origin-center rounded-3xl border border-white/40 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.22),transparent_55%),#0c0c12] px-6 py-10 text-center transition duration-200 hover:scale-[1.03] md:px-10 md:py-12">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold text-white md:text-4xl lg:text-[2.75rem]">
          Que tal comprar{" "}
          <span className="text-[var(--purple-bright)]">Robux</span> pra sua
          conta?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[var(--fg-muted)]">
          Escolha a quantidade, veja o valor na hora e receba com segurança —
          com o melhor preço do Brasil.
        </p>

        <Link
          href="/robux"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-[12px] bg-[var(--purple)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--purple-bright)]"
        >
          <BasketIcon className="h-[18px] w-[18px]" />
          Comprar Robux
        </Link>
      </div>
    </section>
  );
}
