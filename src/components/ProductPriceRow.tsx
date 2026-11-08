import Image from "next/image";

type Props = {
  priceFormatted: string;
  oldPriceFormatted?: string;
  discountLabel?: string;
};

export function DiscountBadge({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border border-[var(--accent-bright)]/40 bg-[var(--accent)]/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[var(--accent-bright)] ${className}`}
    >
      <svg
        viewBox="0 0 16 16"
        className="h-3 w-3 shrink-0"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 4.5 5 8l2.2-2.2L10.5 10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 10H14v-3.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </span>
  );
}

export function ProductPriceRow({
  priceFormatted,
  oldPriceFormatted,
  discountLabel,
}: Props) {
  return (
    <div className="mt-2 flex items-end justify-between gap-2">
      <div className="min-w-0">
        {oldPriceFormatted ? (
          <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[var(--fg-muted)] line-through">
              {oldPriceFormatted}
            </span>
            {discountLabel ? <DiscountBadge label={discountLabel} /> : null}
          </div>
        ) : null}

        <p className="font-display text-base font-bold text-white sm:text-lg">
          {priceFormatted}
        </p>
        <p className="mt-0.5 text-[11px] text-[var(--fg-muted)]">
          À vista no Pix
        </p>
      </div>

      <span
        aria-label="Pix"
        className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#32bcad]/45 bg-[#32bcad]/20"
      >
        <Image
          src="/photos/pix.png"
          alt=""
          width={22}
          height={22}
          className="h-[22px] w-[22px] object-contain"
        />
      </span>
    </div>
  );
}
