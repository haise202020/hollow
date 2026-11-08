import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatBrl,
  getGamepassById,
  itemCategory,
  similarGamepasses,
  type Gamepass,
} from "@/lib/data/catalog";
import { BasketIcon } from "@/components/icons";
import { DiscountBadge } from "@/components/ProductPriceRow";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const item = getGamepassById(id);
  if (!item) return { title: "Produto" };
  return {
    title: item.name,
    description: `${item.name} de ${item.game} com entrega segura na Hollow.`,
  };
}

function SimilarCard({ item }: { item: Gamepass }) {
  return (
    <Link
      href={`/gamepasses/${item.id}`}
      className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121218] transition duration-200 hover:scale-[1.03] hover:border-[var(--accent)]"
    >
      <div className="relative aspect-video w-full bg-[#0d0d12]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 50vw, 240px"
          className="object-cover object-center"
        />
      </div>
      <div className="p-3.5">
        <h3 className="line-clamp-2 font-display text-[14px] font-bold text-white">
          {item.name}
        </h3>
        <p className="mt-2 font-display text-[15px] font-bold text-white">
          {formatBrl(item.priceBrl)}
        </p>
      </div>
    </Link>
  );
}

export default async function GamepassProductPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const item = getGamepassById(id);
  if (!item) notFound();

  const similar = similarGamepasses(item.id, 5);
  const categoryLabel =
    itemCategory(item) === "gamepass" ? "Gamepass" : "Fruta permanente";

  return (
    <div className="gamepasses-page-bg overflow-x-hidden">
      <div className="relative z-10 mx-auto w-[min(1180px,calc(100%-2rem))] pb-20 pt-7 md:pt-9">
        <Link
          href="/gamepasses"
          className="mb-5 inline-flex text-[14px] text-[var(--fg-muted)] transition hover:text-white"
        >
          ← Voltar para gamepasses
        </Link>

        <section className="rounded-[24px] border border-[var(--accent)]/25 bg-[#111118]/92 p-4 shadow-[0_0_70px_rgba(139,92,246,0.18)] md:p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-6">
            {/* Imagem — ocupa o espaço restante e fica em destaque */}
            <div className="relative isolate min-w-0 w-full flex-1">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-2 -z-10 rounded-[22px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.35),transparent_70%)] blur-md"
              />
              <div className="relative aspect-video w-full overflow-hidden rounded-[18px] border border-[var(--accent)]/35 bg-[#0a0a10] shadow-[0_8px_36px_rgba(139,92,246,0.28)]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Infos — só a largura necessária, sem área vazia */}
            <div className="flex w-full shrink-0 flex-col justify-center lg:w-[320px] xl:w-[340px]">
              <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--accent-bright)]">
                {item.game} · {categoryLabel}
              </p>

              <h1 className="mt-2 font-display text-[28px] font-bold leading-[1.12] tracking-tight text-white md:text-[32px]">
                {item.name}
              </h1>

              <span className="mt-3 inline-flex w-fit items-center rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[12px] text-[var(--fg-muted)]">
                100+ em estoque
              </span>

              <div className="mt-5">
                {item.oldPriceBrl ? (
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-[14px] text-[var(--fg-muted)] line-through">
                      {formatBrl(item.oldPriceBrl)}
                    </span>
                    {item.discountLabel ? (
                      <DiscountBadge
                        label={item.discountLabel}
                        className="px-2 py-0.5 text-[11px]"
                      />
                    ) : null}
                  </div>
                ) : null}

                <p className="font-display text-[30px] font-bold leading-none text-white md:text-[32px]">
                  {formatBrl(item.priceBrl)}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span
                    aria-label="Pix"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#32bcad]/45 bg-[#32bcad]/20"
                  >
                    <Image
                      src="/photos/pix.png"
                      alt=""
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px] object-contain"
                    />
                  </span>
                  <p className="text-[13px] text-[var(--fg-muted)]">
                    À vista no Pix
                  </p>
                </div>
              </div>

              <Link
                href={`/checkout?type=gamepass&id=${item.id}`}
                className="mt-6 inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] bg-[var(--accent)] text-[15px] font-bold text-white transition hover:bg-[var(--accent-bright)]"
              >
                <BasketIcon className="h-4 w-4" />
                Comprar agora
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[24px] border border-white/[0.08] bg-[#111118]/92 p-5 md:mt-5 md:p-7">
          <h2 className="font-display text-[20px] font-bold text-[var(--accent-bright)]">
            Descrição
          </h2>

          <div className="mt-4 space-y-5 text-[14px] leading-relaxed text-[var(--fg-muted)] md:text-[15px]">
            <p>
              Você está comprando{" "}
              <span className="font-semibold text-white">{item.name}</span> de{" "}
              {item.game} na Hollow, com entrega segura e suporte.
            </p>

            <div>
              <h3 className="mb-2 font-display text-[16px] font-bold text-white">
                Como receber o seu pedido?
              </h3>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  Depois que pagar no Pix, aguarde a confirmação automática do
                  pedido.
                </li>
                <li>
                  Após a confirmação, nossa equipe inicia a entrega do item na
                  sua conta Roblox.
                </li>
                <li>
                  Em caso de dúvida, fale com o suporte pelo chat do site ou
                  Discord.
                </li>
              </ol>
            </div>

            <div>
              <h3 className="mb-2 font-display text-[16px] font-bold text-white">
                Como entregamos seu pedido?
              </h3>
              <p>
                A entrega é feita de forma segura após a confirmação do
                pagamento. Você recebe atualizações do status e pode acompanhar
                o pedido na sua conta Hollow.
              </p>
            </div>
          </div>
        </section>

        {similar.length > 0 ? (
          <section className="mt-10 md:mt-12">
            <div className="mb-5 flex items-end justify-between gap-3">
              <h2 className="font-display text-[22px] font-bold text-white md:text-[26px]">
                Produtos similares
              </h2>
              <Link
                href="/gamepasses"
                className="shrink-0 text-[14px] text-[var(--accent-bright)] transition hover:text-white"
              >
                Ver todos
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
              {similar.map((entry) => (
                <SimilarCard key={entry.id} item={entry} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
