import Link from "next/link";
import { BasketIcon } from "./icons";

export function HomeCta() {
  return (
    <section className="site-container py-14 md:py-20">
      <div className="relative overflow-hidden rounded-2xl border-none bg-white/[0.03] px-6 py-12 text-center backdrop-blur-xl md:px-12 md:py-16">
        {/* Glass inner highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent"
        />
        {/* Subtle accent glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 h-[300px] w-[300px] rounded-full opacity-30 blur-[100px]"
          style={{ background: "var(--accent-glow)" }}
        />

        <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-bold text-white md:text-4xl">
          Pronto pra comprar{" "}
          <span className="text-[var(--accent)]">Robux?</span>
        </h2>
        <p className="relative mx-auto mt-5 max-w-xl text-lg text-[var(--fg-muted)]">
          Escolha a quantidade, veja o valor na hora e receba com segurança.
        </p>

        <Link
          href="/robux"
          className="relative mt-10 inline-flex items-center justify-center gap-2.5 rounded-lg bg-[var(--accent)] px-7 py-4 text-sm font-semibold text-[#08090d] transition hover:bg-[var(--accent-bright)] hover:shadow-[0_0_24px_var(--accent-glow)]"
        >
          <BasketIcon className="h-[18px] w-[18px]" />
          Comprar Robux
        </Link>
      </div>
    </section>
  );
}
