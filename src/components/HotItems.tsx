import Image from "next/image";
import Link from "next/link";
import { formatBrl, catalogByCategory } from "@/lib/data/catalog";
import { BasketIcon } from "./icons";
import { ProductPriceRow } from "./ProductPriceRow";

export function HotItems() {
  const items = catalogByCategory("permanent").slice(0, 8);
  return (
    <section className="site-container relative overflow-visible py-14 md:py-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-xl font-bold text-white md:text-2xl">
          Itens em Alta
        </h2>
        <Link
          href="/gamepasses"
          className="text-sm font-semibold text-[var(--purple-bright)] transition hover:text-white"
        >
          Ver todos
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/gamepasses/${item.id}`}
            className="relative z-0 flex cursor-pointer select-none flex-col overflow-hidden rounded-2xl border-2 border-[#2a2a32] bg-[#121218] transition duration-200 hover:z-10 hover:scale-[1.04] hover:border-[var(--purple)]"
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

              <span className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--purple)] px-3 py-2.5 text-[13px] font-bold text-white transition hover:bg-[var(--purple-bright)]">
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
