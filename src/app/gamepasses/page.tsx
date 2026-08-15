import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatBrl, hotItems } from "@/lib/data/catalog";
import { CartIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Gamepasses",
  description:
    "Entrega de gamepasses de jogos do Roblox com segurança na Hollow.",
};

export default function GamepassesPage() {
  return (
    <div className="site-container py-12 md:py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--purple-bright)]">
          Gamepasses
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
          Entrega de gamepasses dos seus jogos
        </h1>
        <p className="mt-4 text-[var(--fg-muted)]">
          Compramos e entregamos gamepasses diretamente no Roblox. Ideal para
          VIP, packs, pets e desbloqueios exclusivos.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hotItems.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#12121a]"
          >
            <div className="relative aspect-[16/10] bg-[#0d0d12]">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, 360px"
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">
                {item.game}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                {item.name}
              </h2>
              <p className="mt-3 text-lg font-medium text-[var(--purple-bright)]">
                {formatBrl(item.priceBrl)}
              </p>
              <Link
                href={`/checkout?type=gamepass&id=${item.id}`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--purple)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--purple-bright)]"
              >
                <CartIcon className="h-4 w-4" />
                Pedir entrega
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
