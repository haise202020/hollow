import Image from "next/image";
import Link from "next/link";
import { formatBrl, catalogByCategory } from "@/lib/data/catalog";
import { BasketIcon } from "./icons";
import { ProductPriceRow } from "./ProductPriceRow";

export function HotItems() {
  const items = catalogByCategory("permanent").slice(0, 5);
  return (
    <section className="site-container relative overflow-visible py-8 md:py-10">
      <div className="mb-10 text-center">
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-bright)] md:text-sm">
          Blox Fruits
        </span>
        <h2 className="font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          Itens em Alta
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-base text-[var(--fg-muted)] md:text-lg">
          As frutas mais procuradas com os melhores preços do Brasil.
        </p>
        <Link
          href="/gamepasses"
          className="mt-5 inline-block text-base font-semibold text-[var(--accent)] transition hover:text-[var(--accent-bright)] md:text-lg"
        >
          Ver todos →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/gamepasses/${item.id}`}
            className="relative flex cursor-pointer select-none flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--bg-panel)] transition duration-200 hover:border-[var(--accent)]/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:scale-[1.02]"
          >
            <div className="relative aspect-video bg-[#0d0d12]">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 280px"
                className="pointer-events-none object-cover object-center"
                draggable={false}
              />
            </div>

            <div className="relative flex flex-1 flex-col p-3.5 sm:p-4">
              <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-white sm:text-[15px]">
                {item.name}
              </h3>

              <ProductPriceRow
                priceFormatted={formatBrl(item.priceBrl)}
                oldPriceFormatted={
                  item.oldPriceBrl ? formatBrl(item.oldPriceBrl) : undefined
                }
                discountLabel={item.discountLabel}
              />

              <span className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-3 py-2.5 text-[13px] font-semibold text-[#08090d] transition hover:bg-[var(--accent-bright)]">
                <BasketIcon className="h-4 w-4" />
                Comprar agora
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
