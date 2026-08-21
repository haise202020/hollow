"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { gamepassPriceForNetRobux } from "@/lib/data/catalog";
import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/security/constants";
import { BasketIcon, BoltIcon, LockIcon, ShieldIcon } from "./icons";

type CheckoutType = "robux" | "gamepass" | "custom_gamepass";

type CheckoutOrder = {
  id: string;
  status: "PENDENTE" | "COMPLETO" | "FALHA" | "CANCELADO";
  adminStatus?: "AGUARDANDO" | "APROVADO" | "REJEITADO";
  productLabel: string;
  amountBrl: number;
  amountFormatted: string;
  robloxUsername: string;
  copyPaste?: string;
  qrCodeBase64?: string;
  qrcodeUrl?: string;
  viewToken?: string;
};

type RobloxProfile = {
  id: number;
  name: string;
  displayName: string;
  description: string;
  hasVerifiedBadge: boolean;
  avatarUrl: string | null;
  createdAt: string | null;
};

type DetectedGamepass = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
};

type Step =
  | "username"
  | "confirm"
  | "gamepass"
  | "loading"
  | "pix"
  | "paid"
  | "error";

const CHECKOUT_STEPS_ROBUX = [
  { id: 1, label: "Conta" },
  { id: 2, label: "Gamepass" },
  { id: 3, label: "Pagamento" },
  { id: 4, label: "Concluído" },
] as const;

const CHECKOUT_STEPS_PRODUCT = [
  { id: 1, label: "Conta" },
  { id: 2, label: "Pagamento" },
  { id: 3, label: "Concluído" },
] as const;

function activeStepNumber(step: Step, type: CheckoutType): number {
  if (type === "robux") {
    if (step === "paid") return 4;
    if (step === "loading" || step === "pix") return 3;
    if (step === "gamepass") return 2;
    return 1;
  }

  if (step === "paid") return 3;
  if (step === "loading" || step === "pix") return 2;
  return 1;
}

function CheckoutSteps({
  current,
  type,
}: {
  current: number;
  type: CheckoutType;
}) {
  const steps =
    type === "robux" ? CHECKOUT_STEPS_ROBUX : CHECKOUT_STEPS_PRODUCT;

  return (
    <ol className="mb-8 flex items-center justify-center gap-2 sm:gap-3">
      {steps.map((item, index) => {
        const done = item.id < current;
        const active = item.id === current;
        return (
          <li key={item.id} className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${
                  done
                    ? "bg-[var(--purple)] text-white"
                    : active
                      ? "bg-[var(--purple)]/25 text-[var(--purple-bright)] ring-1 ring-[var(--purple)]"
                      : "bg-white/[0.04] text-[var(--fg-muted)]"
                }`}
              >
                {done ? "✓" : item.id}
              </span>
              <span
                className={`text-[10px] font-medium uppercase tracking-wide sm:text-xs ${
                  active || done ? "text-white" : "text-[var(--fg-muted)]"
                }`}
              >
                {item.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={`mb-5 h-px w-6 sm:w-10 ${
                  done ? "bg-[var(--purple)]" : "bg-white/10"
                }`}
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

type Props = {
  type: CheckoutType;
  robuxAmount?: number;
  gamepassId?: string;
  customGameName?: string;
  customGamepassName?: string;
  amountBrl: number;
  productLabel: string;
  image?: string;
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : null;
}

export function CheckoutClient({
  type,
  robuxAmount,
  gamepassId,
  customGameName,
  customGamepassName,
  amountBrl,
  productLabel,
  image,
}: Props) {
  const [robloxUsername, setRobloxUsername] = useState("");
  const [profile, setProfile] = useState<RobloxProfile | null>(null);
  const [detectedPass, setDetectedPass] = useState<DetectedGamepass | null>(
    null,
  );
  const [step, setStep] = useState<Step>("username");
  const [error, setError] = useState("");
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [copied, setCopied] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [checkingPass, setCheckingPass] = useState(false);

  const requiredGamepassPrice = useMemo(() => {
    if (type !== "robux" || !robuxAmount) return null;
    return gamepassPriceForNetRobux(robuxAmount);
  }, [robuxAmount, type]);

  useEffect(() => {
    if (!order?.id) return;
    if (step !== "pix" && step !== "paid") return;

    const adminStatus = order.adminStatus ?? "AGUARDANDO";
    if (
      step === "paid" &&
      (adminStatus === "APROVADO" || adminStatus === "REJEITADO")
    ) {
      return;
    }

    if (
      step === "pix" &&
      (order.status === "FALHA" || order.status === "CANCELADO")
    ) {
      return;
    }

    const orderId = order.id;
    const token = order.viewToken ?? "";
    let cancelled = false;

    const tick = async () => {
      try {
        const params = new URLSearchParams({ orderId });
        if (token) params.set("token", token);
        const response = await fetch(
          `/api/checkout/status?${params.toString()}`,
          { cache: "no-store" },
        );
        const data = (await response.json()) as {
          order?: CheckoutOrder;
        };
        if (cancelled || !response.ok || !data.order) return;

        setOrder(data.order);

        if (
          data.order.status === "COMPLETO" ||
          (data.order.adminStatus ?? "AGUARDANDO") === "APROVADO"
        ) {
          setStep("paid");
        }
        if (
          data.order.status === "FALHA" ||
          data.order.status === "CANCELADO"
        ) {
          // Se o admin já aprovou, prioriza a liberação do pedido.
          if ((data.order.adminStatus ?? "AGUARDANDO") === "APROVADO") {
            setStep("paid");
          } else {
            setError(
              "Pagamento não concluído. Gere um novo PIX para tentar de novo.",
            );
          }
        }
      } catch {
        // Keep polling quietly.
      }
    };

    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [
    order?.id,
    order?.viewToken,
    order?.status,
    order?.adminStatus,
    step,
  ]);

  async function checkGamepass(silent = false) {
    if (!profile || type !== "robux" || !robuxAmount) return false;

    if (!silent) setCheckingPass(true);
    if (!silent) setError("");

    try {
      const response = await fetch(
        `/api/roblox/gamepass-check?userId=${profile.id}&robuxAmount=${robuxAmount}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as {
        found?: boolean;
        gamepass?: DetectedGamepass;
        error?: string;
      };

      if (!response.ok) {
        if (!silent) setError(data.error ?? "Falha ao verificar a gamepass.");
        return false;
      }

      if (data.found && data.gamepass) {
        setDetectedPass(data.gamepass);
        setError("");
        return true;
      }

      setDetectedPass(null);
      if (!silent) {
        setError(
          `Ainda não encontramos uma gamepass de ${requiredGamepassPrice?.toLocaleString("pt-BR")} Robux na sua conta.`,
        );
      }
      return false;
    } catch {
      if (!silent) setError("Falha de rede ao verificar a gamepass.");
      return false;
    } finally {
      if (!silent) setCheckingPass(false);
    }
  }

  useEffect(() => {
    if (step !== "gamepass" || type !== "robux" || !profile || !robuxAmount) {
      return;
    }

    void checkGamepass(true);
    const timer = window.setInterval(() => {
      void checkGamepass(true);
    }, 5000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, type, profile?.id, robuxAmount]);

  async function lookupUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLookingUp(true);
    setError("");
    setProfile(null);
    setDetectedPass(null);

    try {
      const response = await fetch(
        `/api/roblox/lookup?username=${encodeURIComponent(robloxUsername)}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as {
        profile?: RobloxProfile;
        error?: string;
      };

      if (!response.ok || !data.profile) {
        setStep("username");
        setError(data.error ?? "Usuário não encontrado.");
        return;
      }

      setProfile(data.profile);
      setRobloxUsername(data.profile.name);
      setStep("confirm");
    } catch {
      setError("Falha de rede. Verifique sua conexão.");
      setStep("username");
    } finally {
      setLookingUp(false);
    }
  }

  async function createPayment(gamepassRobloxId?: number) {
    if (!profile) return;

    setStep("loading");
    setError("");

    try {
      const csrf = readCookie(CSRF_COOKIE);
      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { [CSRF_HEADER]: csrf } : {}),
        },
        body: JSON.stringify({
          type,
          ...(type === "robux" && robuxAmount != null ? { robuxAmount } : {}),
          ...(type === "gamepass" && gamepassId ? { gamepassId } : {}),
          ...(type === "custom_gamepass"
            ? {
                customGameName,
                customGamepassName,
                customAmountBrl: amountBrl,
              }
            : {}),
          robloxUsername: profile.name,
          robloxUserId: profile.id,
          ...(gamepassRobloxId != null
            ? { robloxGamepassId: gamepassRobloxId }
            : {}),
        }),
      });

      const data = (await response.json()) as {
        order?: CheckoutOrder;
        error?: string;
      };

      if (!response.ok || !data.order) {
        setStep(type === "robux" ? "gamepass" : "confirm");
        setError(data.error ?? "Não foi possível gerar o PIX.");
        return;
      }

      setOrder(data.order);
      setStep(data.order.status === "COMPLETO" ? "paid" : "pix");
    } catch {
      setStep(type === "robux" ? "gamepass" : "confirm");
      setError("Falha de rede. Verifique sua conexão.");
    }
  }

  async function copyPix() {
    if (!order?.copyPaste) return;
    try {
      await navigator.clipboard.writeText(order.copyPaste);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const currentStep = activeStepNumber(step, type);

  if (step === "paid" && order) {
    const adminStatus = order.adminStatus ?? "AGUARDANDO";
    const isApproved = adminStatus === "APROVADO";
    const isRejected = adminStatus === "REJEITADO";
    const paymentDone = order.status === "COMPLETO" || isApproved;

    return (
      <div>
        <CheckoutSteps current={currentStep} type={type} />
        <div className="mx-auto max-w-xl rounded-3xl border border-white/[0.02] bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.2),transparent_55%),#0c0c12] px-6 py-10 text-center md:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--purple-bright)]">
            {isRejected
              ? "Pedido recusado"
              : paymentDone
                ? "Pagamento concluído"
                : "Pagamento confirmado"}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
            {isRejected
              ? "Não foi possível liberar"
              : paymentDone
                ? "Pedido concluído"
                : "Aguardando aprovação"}
          </h1>
          <p className="mt-4 text-[var(--fg-muted)]">
            {isRejected ? (
              <>
                O pedido{" "}
                <span className="font-semibold text-white">{order.id}</span> foi
                recusado pela equipe. Se precisar, fale com o suporte.
              </>
            ) : paymentDone ? (
              <>
                Seu pedido de{" "}
                <span className="font-semibold text-white">
                  {order.productLabel}
                </span>{" "}
                para{" "}
                <span className="font-semibold text-white">
                  @{order.robloxUsername}
                </span>{" "}
                foi concluído com sucesso.
              </>
            ) : (
              <>
                Seu PIX de {order.amountFormatted} foi confirmado. Estamos
                revisando o carrinho para liberar{" "}
                <span className="font-semibold text-white">
                  {order.productLabel}
                </span>{" "}
                para{" "}
                <span className="font-semibold text-white">
                  @{order.robloxUsername}
                </span>
                . Isso atualiza automaticamente.
              </>
            )}
          </p>
          <p className="mt-3 text-xs text-[var(--fg-muted)]">Pedido {order.id}</p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-[12px] bg-[var(--purple)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--purple-bright)]"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  if (step === "username" || (step === "error" && !profile)) {
    return (
      <div>
        <CheckoutSteps current={currentStep} type={type} />
        <section className="mx-auto w-full max-w-lg rounded-3xl border border-white/[0.02] bg-[#0c0c12] p-6 text-center transition duration-200 hover:scale-[1.02] md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--purple-bright)]">
            Etapa 1
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
            Qual seu nick no Roblox?
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-[var(--fg-muted)]">
            Digite exatamente o usuário da conta que vai receber a entrega.
          </p>

          <form onSubmit={lookupUser} className="mt-8 space-y-4 text-left" noValidate>
            <div>
              <label
                htmlFor="robloxUsername"
                className="mb-1.5 block text-sm text-[var(--fg-muted)]"
              >
                Nick / usuário
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--purple-bright)]">
                  @
                </span>
                <input
                  id="robloxUsername"
                  name="robloxUsername"
                  required
                  minLength={3}
                  maxLength={20}
                  value={robloxUsername}
                  onChange={(event) =>
                    setRobloxUsername(
                      event.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                    )
                  }
                  placeholder="seu_nick"
                  autoComplete="off"
                  autoFocus
                  className="w-full rounded-xl border border-white/10 bg-[#101016] py-3.5 pl-9 pr-4 text-sm text-white outline-none ring-[var(--purple)] transition focus:ring-2"
                />
              </div>
            </div>

            {error ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={lookingUp}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[var(--purple)] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--purple-bright)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {lookingUp ? "Buscando conta…" : "Continuar"}
            </button>
          </form>
        </section>
      </div>
    );
  }

  if (step === "confirm" && profile) {
    return (
      <div>
        <CheckoutSteps current={currentStep} type={type} />
        <section className="mx-auto w-full max-w-lg rounded-3xl border border-white/[0.02] bg-[#0c0c12] p-6 transition duration-200 hover:scale-[1.02] md:p-10">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.14em] text-[var(--purple-bright)]">
            Etapa 1
          </p>
          <h1 className="mt-2 text-center font-display text-3xl font-bold text-white md:text-4xl">
            Confirme sua conta
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-center text-sm text-[var(--fg-muted)]">
            Confira se o perfil abaixo é o seu antes de continuar.
          </p>

          <div className="mt-8 space-y-5">
            <div className="rounded-2xl border border-white/10 bg-[#101016] p-5">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#15151c]">
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[var(--fg-muted)]">
                      Sem foto
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-display text-xl font-bold text-white">
                    {profile.displayName}
                    {profile.hasVerifiedBadge ? (
                      <span className="ml-2 text-sm text-[var(--purple-bright)]">
                        ✓
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--purple-bright)]">
                    @{profile.name}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">
                  Bio
                </p>
                <p className="mt-1 text-sm leading-relaxed text-white/90">
                  {profile.description || "Sem bio no perfil."}
                </p>
              </div>
            </div>

            <p className="text-center font-display text-lg font-semibold text-white">
              Essa conta é você?
            </p>

            {error ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setProfile(null);
                  setDetectedPass(null);
                  setError("");
                  setStep("username");
                }}
                className="rounded-[12px] border border-white/15 px-4 py-3.5 text-sm font-semibold text-white transition hover:border-white/30"
              >
                Não, trocar
              </button>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  if (type === "robux") {
                    setStep("gamepass");
                  } else {
                    void createPayment();
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[var(--purple)] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--purple-bright)]"
              >
                Sim, sou eu
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (
    (step === "gamepass" || step === "loading") &&
    profile &&
    type === "robux" &&
    requiredGamepassPrice
  ) {
    return (
      <div className="select-none" onDragStart={(e) => e.preventDefault()}>
        <CheckoutSteps current={currentStep} type={type} />
        <div className="mx-auto grid max-w-5xl select-none gap-5 lg:grid-cols-[1.45fr_0.9fr] lg:items-start">
          <section className="rounded-2xl border border-white/[0.02] bg-[#09090d] p-5 transition duration-200 hover:scale-[1.01] md:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--purple-bright)]">
              Etapa 2
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">
              Configure a gamepass
            </h1>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Use exatamente o preço abaixo. O site detecta sozinho quando ela
              estiver pronta.
            </p>

            <div className="mt-6 rounded-2xl p-5 text-center">
              <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">
                Preço obrigatório
              </p>
              <p className="mt-2 font-display text-4xl font-bold text-white">
                <span className="select-text">
                  {requiredGamepassPrice.toLocaleString("pt-BR")}
                </span>
                <span className="ml-2 text-lg text-[var(--purple-bright)]">
                  Robux
                </span>
              </p>
              <p className="mt-2 text-xs text-[var(--fg-muted)]">
                Assim você recebe{" "}
                {robuxAmount?.toLocaleString("pt-BR")} Robux líquidos (taxa de
                30% já coberta).
              </p>
            </div>

            <div className="mt-5 flex justify-center p-1">
              {detectedPass ? (
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#15151c]">
                    {detectedPass.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={detectedPass.imageUrl}
                        alt={detectedPass.name}
                        className="pointer-events-none h-full w-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--fg-muted)]">
                        Sem foto
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-emerald-300">
                      Gamepass detectada
                    </p>
                    <p className="mt-0.5 truncate text-white">
                      <span className="select-text">{detectedPass.name}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                      <span className="select-text">ID {detectedPass.id}</span>
                      {" · "}
                      {detectedPass.price.toLocaleString("pt-BR")} Robux
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-semibold text-amber-200">
                    Aguardando gamepass…
                  </p>
                  <p className="mt-1 text-xs text-[var(--fg-muted)]">
                    Verificando automaticamente a cada poucos segundos.
                  </p>
                </div>
              )}
            </div>

            {error ? (
              <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={checkingPass || step === "loading"}
                onClick={() => void checkGamepass(false)}
                className="rounded-[12px] border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/30 disabled:opacity-60"
              >
                {checkingPass ? "Verificando…" : "Verificar agora"}
              </button>
              <button
                type="button"
                disabled={!detectedPass || step === "loading"}
                onClick={() => void createPayment(detectedPass?.id)}
                className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[var(--purple)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--purple-bright)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <BasketIcon className="h-[18px] w-[18px]" />
                {step === "loading" ? "Gerando PIX…" : "Continuar para o PIX"}
              </button>
            </div>

            <button
              type="button"
              disabled={step === "loading"}
              onClick={() => {
                setDetectedPass(null);
                setError("");
                setStep("confirm");
              }}
              className="mt-4 w-full text-sm text-[var(--fg-muted)] transition hover:text-white"
            >
              Voltar
            </button>
          </section>

          <aside className="rounded-2xl border border-white/[0.02] bg-[#09090d] p-5 transition duration-200 hover:scale-[1.01] md:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--purple-bright)]">
              Tutorial
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">
              Como criar a gamepass
            </h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Siga estes passos no Roblox Creator Dashboard.
            </p>

            <ol className="mt-6 space-y-4">
              {[
                {
                  title: "Abra o Creator Dashboard",
                  text: "Acesse create.roblox.com e entre na sua conta.",
                },
                {
                  title: "Escolha uma experiência",
                  text: "Use uma experiência sua ou crie uma nova só pra isso.",
                },
                {
                  title: "Crie a gamepass",
                  text: (
                    <>
                      Defina o preço em exatamente{" "}
                      <span className="select-text">
                        {requiredGamepassPrice.toLocaleString("pt-BR")}
                      </span>{" "}
                      Robux.
                    </>
                  ),
                },
                {
                  title: "Deixe à venda",
                  text: "Publique/ative a gamepass e volte aqui pra continuar.",
                },
              ].map((item, index) => (
                <li key={item.title} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--purple)]/20 text-sm font-bold text-[var(--purple-bright)]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-[var(--fg-muted)]">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <a
              href="https://create.roblox.com/dashboard/creations"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center rounded-[12px] border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:border-[var(--purple)]/50 hover:text-[var(--purple-bright)]"
            >
              Abrir Creator Dashboard
            </a>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div>
      <CheckoutSteps current={currentStep} type={type} />

      {step === "pix" && order ? (
        <div
          className="mx-auto grid max-w-5xl select-none gap-6 lg:grid-cols-[1.5fr_0.9fr] lg:items-start"
          onDragStart={(e) => e.preventDefault()}
        >
          <section className="-ml-[2cm] w-[calc(100%+2cm)] rounded-2xl border border-white/[0.02] bg-[#09090d] p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--purple)]/15 px-3 py-1 text-[11px] font-semibold text-[var(--purple-bright)]">
                Etapa 3 · PIX
              </span>
              <span className="rounded-full border border-white/[0.06] px-3 py-1 text-[11px] text-[var(--fg-muted)]">
                Status:{" "}
                {order.status === "PENDENTE" ? "Aguardando" : order.status}
              </span>
            </div>

            <h1 className="mt-3.5 font-display text-[1.75rem] font-bold text-white md:text-[2rem]">
              Escaneie e pague
            </h1>
            <p className="mt-2 max-w-lg text-sm text-[var(--fg-muted)]">
              Assim que o PIX cair, confirmamos sozinhos e seguimos com a
              entrega pra{" "}
              <span className="select-text">@{order.robloxUsername}</span>.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="mx-auto flex h-[170px] w-[170px] items-center justify-center rounded-2xl border border-white/[0.06] bg-[#ececef] p-2.5 sm:mx-0">
                {order.qrCodeBase64 || order.qrcodeUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={order.qrCodeBase64 || order.qrcodeUrl}
                    alt="QR Code PIX"
                    className="pointer-events-none h-full w-full object-contain"
                    draggable={false}
                  />
                ) : (
                  <p className="text-xs text-black/60">QR indisponível</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { title: "Abra o banco", text: "Entre na área PIX do app" },
                  { title: "Leia o QR", text: "Ou use o copia e cola" },
                  { title: "Confirme", text: "Valide o valor e pague" },
                  { title: "Pronto", text: "A Hollow confirma sozinha" },
                ].map((item, index) => (
                  <div key={item.title} className="rounded-xl bg-[var(--bg)] p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--purple-bright)]">
                      0{index + 1}
                    </p>
                    <p className="mt-1 font-display text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-[var(--fg-muted)]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-xl p-3.5">
              <p className="mb-2 text-xs font-medium text-[var(--fg-muted)]">
                Código PIX copia e cola
              </p>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <input
                  readOnly
                  value={order.copyPaste ?? ""}
                  className="min-w-0 flex-1 select-text truncate rounded-lg border border-white/[0.06] bg-[#09090d] px-3.5 py-2.5 text-xs text-[#cfcfd8] outline-none"
                />
                <button
                  type="button"
                  onClick={copyPix}
                  className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition ${
                    copied
                      ? "bg-[var(--purple-deep)]"
                      : "bg-[var(--purple)] hover:bg-[var(--purple-bright)]"
                  }`}
                >
                  {copied ? "Copiado!" : "Copiar código"}
                </button>
              </div>
              <p className="mt-2.5 truncate text-[11px] text-[var(--fg-muted)]">
                <span className="select-text">Pedido {order.id}</span>
              </p>
            </div>

            {error ? (
              <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setOrder(null);
                setError("");
                setStep(type === "robux" ? "gamepass" : "confirm");
              }}
              className="mt-4 text-sm text-[var(--fg-muted)] transition hover:text-white"
            >
              Voltar
            </button>
          </section>

          <aside className="mt-[1.5cm] translate-x-[1cm] rounded-xl border border-white/[0.02] bg-[#09090d] p-4 font-sans md:p-5">
            <p className="font-display text-sm font-semibold text-[var(--purple-bright)]">
              Valor Total
            </p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
              <p className="font-display text-[2.1rem] font-bold leading-none tracking-tight text-white md:text-[2.45rem]">
                {order.amountFormatted}
              </p>
              <p className="mb-0.5 inline-flex items-center gap-1 font-sans text-xs text-[var(--fg-muted)]">
                <LockIcon className="h-3 w-3" />
                Pagamento 100% Seguro
              </p>
            </div>

            <div className="mt-6 space-y-3.5">
              <div>
                <p className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-white">
                  <LockIcon className="h-3.5 w-3.5 shrink-0 text-[var(--purple-bright)]" />
                  Ambiente Seguro
                </p>
                <p className="mt-0.5 font-sans text-xs leading-relaxed text-[var(--fg-muted)]">
                  Seus dados protegidos em toda a compra.
                </p>
              </div>

              <div>
                <p className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-white">
                  <BoltIcon className="h-3.5 w-3.5 shrink-0 text-[var(--purple-bright)]" />
                  Pagamento Instantâneo
                </p>
                <p className="mt-0.5 font-sans text-xs leading-relaxed text-[var(--fg-muted)]">
                  Confirmação automática via PIX.
                </p>
              </div>

              <div className="border-t border-white/10 pt-3.5">
                <p className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-white">
                  <ShieldIcon className="h-3.5 w-3.5 shrink-0 text-[var(--purple-bright)]" />
                  Garantia Hollow
                </p>
                <p className="mt-0.5 font-sans text-xs leading-relaxed text-[var(--fg-muted)]">
                  Entrega segura para{" "}
                  <span className="select-text">@{order.robloxUsername}</span>.
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-3.5">
              <p className="font-display text-xs font-medium uppercase tracking-[0.14em] text-[var(--fg-muted)]">
                Pedido
              </p>
              <p className="mt-1 font-display text-sm font-semibold text-white">
                {productLabel}
              </p>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
