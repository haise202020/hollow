import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutClient } from "@/components/CheckoutClient";
import {
  hotItems,
  robuxToBrl,
  ROBUX_MAX,
  ROBUX_MIN,
  ROBUX_STEP,
} from "@/lib/data/catalog";
import {
  CUSTOM_GAMEPASS_MAX_BRL,
  CUSTOM_GAMEPASS_MIN_BRL,
} from "@/lib/orders/pricing";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalize sua compra de Robux ou gamepasses na Hollow com PIX.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const type = first(params.type);
  const gamepassId = first(params.id) ?? first(params.gamepassId);
  const robuxRaw = Number(first(params.amount) ?? first(params.robuxAmount));

  if (type === "robux") {
    const amount = robuxRaw;
    const valid =
      Number.isFinite(amount) &&
      amount >= ROBUX_MIN &&
      amount <= ROBUX_MAX &&
      amount % ROBUX_STEP === 0;

    if (!valid) {
      return (
        <InvalidCheckout
          message="Quantidade de Robux inválida."
          href="/robux"
          action="Escolher Robux"
        />
      );
    }

    return (
      <div className="site-container py-12 md:py-16">
        <CheckoutClient
          type="robux"
          robuxAmount={amount}
          amountBrl={Math.round(robuxToBrl(amount) * 100) / 100}
          productLabel={`${amount.toLocaleString("pt-BR")} Robux`}
        />
      </div>
    );
  }

  if (type === "gamepass") {
    const item = hotItems.find((entry) => entry.id === gamepassId);
    if (!item) {
      return (
        <InvalidCheckout
          message="Gamepass não encontrada."
          href="/gamepasses"
          action="Ver gamepasses"
        />
      );
    }

    return (
      <div className="site-container py-12 md:py-16">
        <CheckoutClient
          type="gamepass"
          gamepassId={item.id}
          amountBrl={item.priceBrl}
          productLabel={`${item.name} (${item.game})`}
          image={item.image}
        />
      </div>
    );
  }

  if (type === "custom_gamepass") {
    const gameName = (first(params.game) ?? "").trim();
    const passName = (first(params.name) ?? "").trim();
    const amountBrl =
      Math.round(Number(first(params.amount) ?? first(params.price)) * 100) /
      100;

    const valid =
      gameName.length >= 2 &&
      gameName.length <= 80 &&
      passName.length >= 2 &&
      passName.length <= 80 &&
      Number.isFinite(amountBrl) &&
      amountBrl >= CUSTOM_GAMEPASS_MIN_BRL &&
      amountBrl <= CUSTOM_GAMEPASS_MAX_BRL;

    if (!valid) {
      return (
        <InvalidCheckout
          message="Dados da gamepass personalizada inválidos."
          href="/gamepasses/personalizada"
          action="Preencher novamente"
        />
      );
    }

    return (
      <div className="site-container py-12 md:py-16">
        <CheckoutClient
          type="custom_gamepass"
          customGameName={gameName}
          customGamepassName={passName}
          amountBrl={amountBrl}
          productLabel={`${passName} (${gameName})`}
        />
      </div>
    );
  }

  return (
    <InvalidCheckout
      message="Escolha um produto para continuar."
      href="/robux"
      action="Ir para Robux"
    />
  );
}

function InvalidCheckout({
  message,
  href,
  action,
}: {
  message: string;
  href: string;
  action: string;
}) {
  return (
    <div className="site-container py-16">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/15 bg-[#0c0c12] px-6 py-10 text-center">
        <h1 className="font-display text-3xl font-bold text-white">Checkout</h1>
        <p className="mt-3 text-[var(--fg-muted)]">{message}</p>
        <Link
          href={href}
          className="mt-8 inline-flex rounded-[12px] bg-[var(--purple)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--purple-bright)]"
        >
          {action}
        </Link>
      </div>
    </div>
  );
}
