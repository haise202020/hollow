import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gamepasses",
  description: "Entrega de gamepasses em breve na Hollow.",
};

export default function GamepassesPage() {
  return (
    <div className="site-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center md:py-24">
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--purple-bright)]">
        Gamepasses
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
        Em breve
      </h1>
      <p className="mt-4 max-w-md text-[var(--fg-muted)]">
        A entrega de gamepasses está sendo preparada. Por enquanto, compre Robux
        com o melhor preço.
      </p>
      <Link
        href="/robux"
        className="mt-8 inline-flex rounded-xl bg-[var(--purple)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--purple-bright)]"
      >
        Comprar Robux
      </Link>
    </div>
  );
}
