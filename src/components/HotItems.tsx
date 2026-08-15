import Image from "next/image";
import Link from "next/link";
import { formatBrl, hotItems } from "@/lib/data/catalog";
import { BasketIcon } from "./icons";

export function HotItems() {
  return (
    <section className="site-container relative overflow-visible py-14 md:py-16">
      <div className="relative mb-6 flex min-h-[72px] items-end justify-end md:min-h-[88px]">
        <div className="pointer-events-none absolute bottom-0 left-[9.1cm] z-10 w-[min(480px,75%)]">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 z-0 h-[45%] w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--purple)]/20 blur-2xl"
          />
          <Image
            src="/photos/25.png"
            alt="Itens em alta"
            width={1672}
            height={941}
            sizes="(max-width: 768px) 75vw, 480px"
            className="relative z-[1] h-auto w-full object-contain object-left opacity-100"
            priority
          />
        </div>

        <Link
          href="/gamepasses"
          className="relative z-20 text-sm font-semibold text-[var(--purple-bright)] transition hover:text-white"
        >
          Ver todos
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {hotItems.map((item) => (
          <Link
            key={item.id}
            href={`/checkout?type=gamepass&id=${item.id}`}
            className="relative z-0 flex cursor-pointer select-none flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d12] transition duration-200 hover:z-10 hover:scale-[1.04] hover:border-[var(--purple)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.8)]"
          >
            <div className="relative aspect-video bg-[#15151c]">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="pointer-events-none object-contain object-center"
                draggable={false}
              />
            </div>

            <div className="relative flex flex-1 flex-col overflow-hidden p-3.5">
              {item.id === "gp-dragon" ||
              item.id === "gp-kitsune" ||
              item.id === "gp-control" ||
              item.id === "gp-yeti" ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--purple)]/20 blur-2xl"
                />
              ) : null}

              <h3 className="relative z-[1] font-display text-base font-bold leading-snug text-white">
                {item.name}
              </h3>

              <div className="relative z-[1] mt-3">
                {item.oldPriceBrl ? (
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[var(--fg-muted)] line-through">
                      {formatBrl(item.oldPriceBrl)}
                    </span>
                    {item.discountLabel ? (
                      <span className="rounded-md bg-[var(--purple)]/20 px-1.5 py-0.5 text-[10px] font-bold text-[var(--purple-bright)]">
                        ↓ {item.discountLabel}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <p className="font-display text-xl font-bold text-white">
                  {formatBrl(item.priceBrl)}
                </p>
                <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                  À vista no Pix
                </p>
              </div>

              <span className="relative z-[1] mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[var(--purple)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--purple-bright)]">
                <BasketIcon className="h-[18px] w-[18px]" />
                Comprar agora
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
