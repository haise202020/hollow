"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { gamepassPriceForNetRobux } from "@/lib/data/catalog";
import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/security/constants";
import { BasketIcon, BoltIcon, LockIcon, ShieldIcon } from "./icons";

/**
 * Verifica se uma URL é realmente uma imagem de QR code utilizável.
 * URLs de checkout/redirecionamento da SevenPay (ex: /pix/{uuid}) são páginas HTML,
 * não imagens — usá-las em <img> resulta em imagem quebrada.
 */
function isValidQrImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  // Base64 data URIs são sempre válidas
  if (url.startsWith("data:image/")) return true;
  // URLs externas devem apontar diretamente para uma imagem
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    return /\.(png|jpg|jpeg|gif|svg|webp)(\?|$)/i.test(path);
  } catch {
    return false;
  }
}

/**
 * Gera URL de QR code via api.qrserver.com a partir do código PIX copia-e-cola
 * quando a SevenPay não retorna qrCodeBase64 ou qrcodeUrl válido.
 * Evita dependência da biblioteca `qrcode` que usa APIs Node.js indisponíveis no navegador.
 */
function buildQrUrlFromCopyPaste(copyPaste: string): string | null {
  if (!copyPaste) return null;
  const encoded = encodeURIComponent(copyPaste);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=1&bgcolor=ececef&data=${encoded}`;
}

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
                    ? "bg-[var(--accent)] text-white"
                    : active
                      ? "bg-[var(--accent)]/25 text-[var(--accent-bright)] ring-1 ring-[var(--accent)]"
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
                  done ? "bg-[var(--accent)]" : "bg-white/10"
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
  resumeOrderId?: string;
  resumeViewToken?: string;
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
  resumeOrderId,
  resumeViewToken,
}: Props) {
  const [robloxUsername, setRobloxUsername] = useState("");
  const [profile, setProfile] = useState<RobloxProfile | null>(null);
  const [detectedPass, setDetectedPass] = useState<DetectedGamepass | null>(
    null,
  );
  const [step, setStep] = useState<Step>("username");
  const [error, setError] = useState("");
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [generatedQr, setGeneratedQr] = useState<string | null>(null);

  // Gera URL de QR code via api.qrserver.com quando a SevenPay não retorna imagem válida
  // URLs de checkout/redirecionamento (ex: /pix/{uuid}) são páginas HTML, não imagens
  const validApiQr = isValidQrImageUrl(order?.qrCodeBase64) ? order!.qrCodeBase64 : null;
  const validExtQr = isValidQrImageUrl(order?.qrcodeUrl) ? order!.qrcodeUrl : null;

  useEffect(() => {
    if (validApiQr || validExtQr) {
      setGeneratedQr(null);
      return;
    }
    if (!order?.copyPaste) {
      setGeneratedQr(null);
      return;
    }
    setGeneratedQr(buildQrUrlFromCopyPaste(order.copyPaste));
  }, [order?.copyPaste, validApiQr, validExtQr]);

  // Retomada de pedido existente: carrega dados e pula para etapa PIX
  useEffect(() => {
    if (!resumeOrderId) return;
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({ orderId: resumeOrderId });
        if (resumeViewToken) params.set("token", resumeViewToken);
        const res = await fetch(`/api/checkout/status?${params.toString()}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as { order?: CheckoutOrder };
        if (cancelled || !res.ok || !data.order) return;
        setOrder(data.order);
        setRobloxUsername(data.order.robloxUsername ?? "");
        if (
          data.order.status === "COMPLETO" ||
          (data.order.adminStatus ?? "AGUARDANDO") === "APROVADO"
        ) {
          router.replace(`/chat/${resumeOrderId}`);
          return;
        }
        setStep("pix");
      } catch {
        // silencioso — polling existente cuidará de retries
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resumeOrderId, resumeViewToken]);

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
          router.replace(`/chat/${orderId}`);
          return;
        }
        if (
          data.order.status === "FALHA" ||
          data.order.status === "CANCELADO"
        ) {
          // Se o admin já aprovou, redireciona direto ao chat.
          if ((data.order.adminStatus ?? "AGUARDANDO") === "APROVADO") {
            router.replace(`/chat/${orderId}`);
            return;
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
    router,
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
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent-bright)]">
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
            className="mt-8 inline-flex rounded-[12px] bg-[var(--accent)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--accent-bright)]"
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
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent-bright)]">
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
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--accent-bright)]">
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
                  className="w-full rounded-xl border border-white/10 bg-[#101016] py-3.5 pl-9 pr-4 text-sm text-white outline-none ring-[var(--accent)] transition focus:ring-2"
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[var(--accent)] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--accent-bright)] disabled:cursor-not-allowed disabled:opacity-60"
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
          <p className="text-center text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent-bright)]">
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
                      <span className="ml-2 text-sm text-[var(--accent-bright)]">
                        ✓
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--accent-bright)]">
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
                className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[var(--accent)] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--accent-bright)]"
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
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent-bright)]">
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
                <span className="ml-2 text-lg text-[var(--accent-bright)]">
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
                    <p className="text-sm font-semibold text-purple-300">
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
                className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-bright)] disabled:cursor-not-allowed disabled:opacity-60"
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
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent-bright)]">
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
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20 text-sm font-bold text-[var(--accent-bright)]">
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
              className="mt-6 inline-flex w-full items-center justify-center rounded-[12px] border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:border-[var(--accent)]/50 hover:text-[var(--accent-bright)]"
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
          className="mx-auto flex max-w-md flex-col items-center gap-6 select-none py-4 lg:max-w-none"
          onDragStart={(e) => e.preventDefault()}
        >
          {/* Wrapper relativo: ancora o card lateral ao card principal centralizado */}
          <div className="relative w-full max-w-md">
          {/* Card principal — QR Code + Copia e Cola (sempre centralizado) */}
          <section className="relative z-10 w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-[#09090d] px-6 pb-8 pt-10 text-center">
            {/* Acento roxo no topo */}
            <div className="absolute left-1/2 top-0 h-[3px] w-16 -translate-x-1/2 rounded-b-full bg-[var(--accent)]" />

            <h1 className="font-display text-xl font-bold text-white md:text-2xl">
              Concluir pagamento
            </h1>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Use a câmera do seu celular para escanear o QR Code.
            </p>

            {/* QR Code centralizado */}
            <div className="mx-auto mt-6 flex h-[220px] w-[220px] items-center justify-center rounded-2xl border border-white/[0.06] bg-white p-3">
              {validApiQr || validExtQr || generatedQr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={validApiQr || validExtQr || generatedQr!}
                  alt="QR Code PIX"
                  className="pointer-events-none h-full w-full object-contain"
                  draggable={false}
                />
              ) : order.copyPaste ? (
                <p className="text-xs text-black/60">Gerando QR…</p>
              ) : (
                <p className="text-xs text-black/60">QR indisponível</p>
              )}
            </div>

            {/* Divisor + Copia e Cola */}
            <div className="mx-auto mt-6 h-px w-full max-w-xs bg-white/[0.06]" />
            <p className="mt-4 text-xs font-medium text-[var(--fg-muted)]">
              Ou use o copia e cola
            </p>

            <div className="mx-auto mt-3 flex max-w-sm items-center gap-2">
              <input
                readOnly
                value={order.copyPaste ?? ""}
                className="min-w-0 flex-1 select-text truncate rounded-lg border border-white/[0.06] bg-[#121113] px-3.5 py-2.5 text-xs font-semibold text-white outline-none"
              />
              <button
                type="button"
                onClick={copyPix}
                className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition ${
                  copied
                    ? "bg-[var(--accent-deep)]"
                    : "bg-[var(--accent)] hover:bg-[var(--accent-bright)]"
                }`}
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>

            {error ? (
              <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex items-center justify-center gap-3 text-[11px] text-[var(--fg-muted)]">
              <span className="select-text">Pedido {order.id}</span>
              <span className="text-white/20">·</span>
              <span className="font-semibold text-white">{order.amountFormatted}</span>
              <span className="text-white/20">·</span>
              <span>
                {order.status === "PENDENTE" ? "Aguardando" : order.status}
              </span>
            </div>

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
          </div>

          {/* Card secundário — Como pagar com PIX (fixo à direita do centro em telas grandes) */}
          <section className="relative w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-[#09090d] p-6 lg:fixed lg:left-[calc(50%+14rem)] lg:top-[250px] lg:w-[280px] lg:z-20">
            {/* Acento roxo na lateral esquerda */}
            <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-[var(--accent)]" />

            <h2 className="font-display text-base font-bold text-white">
              Como pagar com PIX?
            </h2>

            <div className="mt-4 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15">
                  <svg className="h-4 w-4 text-[var(--accent-bright)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
                  Abra o aplicativo do seu banco e escaneie o QR Code acima.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15">
                  <svg className="h-4 w-4 text-[var(--accent-bright)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
                  Copie o código Pix e cole no aplicativo do seu banco.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15">
                  <svg className="h-4 w-4 text-[var(--accent-bright)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
                  Após o pagamento, o pedido será processado automaticamente.
                </p>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
