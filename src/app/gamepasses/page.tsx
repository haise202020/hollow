import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  catalogByCategory,
  formatBrl,
  type Gamepass,
} from "@/lib/data/catalog";
import { BasketIcon } from "@/components/icons";
import { ProductPriceRow } from "@/components/ProductPriceRow";

export const metadata: Metadata = {
  title: "Gamepasses",
  description:
    "Entrega de gamepasses de jogos do Roblox com segurança na Hollow.",
};

function ProductCard({ item }: { item: Gamepass }) {
  return (
    <article className="relative z-0 flex flex-col overflow-hidden rounded-2xl border-2 border-[#2a2a32] bg-[#121218] transition duration-200 hover:z-10 hover:scale-[1.04] hover:border-[var(--purple)]">
      <div className="relative aspect-video bg-[#0d0d12]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 280px"
          className="object-cover object-center"
        />
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h2 className="line-clamp-2 font-display text-sm font-bold leading-snug text-white sm:text-[15px]">
          {item.name}
        </h2>

        <ProductPriceRow
          priceFormatted={formatBrl(item.priceBrl)}
          oldPriceFormatted={
            item.oldPriceBrl ? formatBrl(item.oldPriceBrl) : undefined
          }
          discountLabel={item.discountLabel}
        />

        <Link
          href={`/gamepasses/${item.id}`}
          className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--purple)] px-3 py-2.5 text-[13px] font-bold text-white transition hover:bg-[var(--purple-bright)]"
        >
          <BasketIcon className="h-4 w-4" />
          Comprar agora
        </Link>
      </div>
    </article>
  );
}

function ProductSection({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: Gamepass[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-4 text-center">
        <h2 className="font-display text-xl font-bold text-white md:text-2xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default function GamepassesPage() {
  const permanents = catalogByCategory("permanent");
  const gamepasses = catalogByCategory("gamepass");

  return (
    <div className="gamepasses-page-bg">
      <div
        className="relative z-10 mx-auto w-[min(1400px,calc(100%-1.5rem))] py-10 md:py-14"
        style={{ zoom: 1.1 }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--purple-bright)]">
            Blox Fruits
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
            Frutas e gamepasses
          </h1>
          <p className="mt-3 text-sm text-[var(--fg-muted)] md:text-base">
            Permanentes e gamepasses do Blox Fruits com entrega segura.
          </p>
        </div>

        <ProductSection
          title="Frutas permanentes"
          subtitle="Permanentes do Blox Fruits"
          items={permanents}
        />

        <ProductSection
          title="Gamepasses"
          subtitle="Gamepasses do Blox Fruits"
          items={gamepasses}
        />

        <section className="mt-14">
          <div className="mx-auto max-w-2xl rounded-3xl border-2 border-[#2a2a32] bg-[#121218]/80 px-6 py-8 text-center md:px-10">
            <h2 className="font-display text-xl font-bold text-white md:text-2xl">
              Não encontrou o que procura?
            </h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)] md:text-base">
              Monte um pedido personalizado com o nome do jogo, da gamepass e o
              valor — e pague via Pix na hora.
            </p>
            <Link
              href="/gamepasses/personalizada"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--purple)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--purple-bright)]"
            >
              Pedir gamepass personalizada
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
