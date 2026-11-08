import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api/response";
import { getSession } from "@/lib/auth/session";
import { formatBrl, gamepassPriceForNetRobux } from "@/lib/data/catalog";
import { resolveCheckoutItem } from "@/lib/orders/pricing";
import { createOrderId, createOrderViewToken, findRecentPendingOrder, saveOrder } from "@/lib/orders/store";
import type { Order } from "@/lib/orders/types";
import {
  createPixTransaction,
  normalizePaymentStatus,
} from "@/lib/payments/sevenpay";
import { findMatchingGamepass } from "@/lib/roblox/gamepasses";
import { gatewayPayerFromUsername, lookupRobloxUser } from "@/lib/roblox/lookup";
import { assertCsrf, CSRF_COOKIE } from "@/lib/security/csrf-core";
import { ensureCsrfCookie } from "@/lib/security/csrf";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { sanitizeText, sanitizeUsername } from "@/lib/security/sanitize";

const bodySchema = z.object({
  type: z.enum(["robux", "gamepass", "custom_gamepass"]),
  robuxAmount: z.number().optional(),
  gamepassId: z.string().optional(),
  customGameName: z.string().min(2).max(80).optional(),
  customGamepassName: z.string().min(2).max(80).optional(),
  customAmountBrl: z.number().optional(),
  robloxUsername: z.string().min(3).max(20),
  robloxUserId: z.number().int().positive(),
  robloxGamepassId: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(`checkout-create:${ip}`, 8, 60_000);

  if (!limited.success) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieToken = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CSRF_COOKIE}=`))
    ?.split("=")[1];

  if (!(await assertCsrf(request, cookieToken))) {
    // Token inválido (ex: CSRF_SECRET trocado após atualização do .env.local).
    // Em vez de bloquear com 403, emitir novo cookie e pedir ao frontend para
    // reenviar a requisição com o token fresco.
    await ensureCsrfCookie();
    return NextResponse.json(
      { error: "Token CSRF expirado. Tente novamente." },
      { status: 419 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  const robuxAmountRaw =
    raw.robuxAmount === undefined || raw.robuxAmount === null || raw.robuxAmount === ""
      ? undefined
      : Number(raw.robuxAmount);
  const customAmountRaw =
    raw.customAmountBrl === undefined ||
    raw.customAmountBrl === null ||
    raw.customAmountBrl === ""
      ? undefined
      : Number(raw.customAmountBrl);
  const robloxGamepassIdRaw =
    raw.robloxGamepassId === undefined ||
    raw.robloxGamepassId === null ||
    raw.robloxGamepassId === ""
      ? undefined
      : Number(raw.robloxGamepassId);

  const candidate = {
    type: raw.type,
    robuxAmount:
      robuxAmountRaw !== undefined && Number.isFinite(robuxAmountRaw)
        ? robuxAmountRaw
        : undefined,
    gamepassId:
      typeof raw.gamepassId === "string"
        ? sanitizeText(raw.gamepassId, 40)
        : undefined,
    customGameName:
      typeof raw.customGameName === "string"
        ? sanitizeText(raw.customGameName, 80)
        : undefined,
    customGamepassName:
      typeof raw.customGamepassName === "string"
        ? sanitizeText(raw.customGamepassName, 80)
        : undefined,
    customAmountBrl:
      customAmountRaw !== undefined && Number.isFinite(customAmountRaw)
        ? customAmountRaw
        : undefined,
    robloxUsername: sanitizeUsername(raw.robloxUsername),
    robloxUserId: Number(raw.robloxUserId),
    robloxGamepassId:
      robloxGamepassIdRaw !== undefined && Number.isFinite(robloxGamepassIdRaw)
        ? robloxGamepassIdRaw
        : undefined,
  };

  const parsed = bodySchema.safeParse(candidate);
  if (!parsed.success) {
    return apiError("Dados inválidos.", 400, {
      details: parsed.error.flatten(),
    });
  }

  let profile;
  try {
    profile = await lookupRobloxUser(parsed.data.robloxUsername);
  } catch {
    return NextResponse.json(
      { error: "Não foi possível validar o usuário do Roblox." },
      { status: 502 },
    );
  }

  if (!profile || profile.id !== parsed.data.robloxUserId) {
    return NextResponse.json(
      { error: "Conta do Roblox inválida. Busque o usuário novamente." },
      { status: 400 },
    );
  }

  const item = resolveCheckoutItem({
    type: parsed.data.type,
    robuxAmount: parsed.data.robuxAmount,
    gamepassId: parsed.data.gamepassId,
    customGameName: parsed.data.customGameName,
    customGamepassName: parsed.data.customGamepassName,
    customAmountBrl: parsed.data.customAmountBrl,
  });

  if (!item) {
    return NextResponse.json({ error: "Produto inválido." }, { status: 400 });
  }

  if (item.amountBrl < 1) {
    return NextResponse.json(
      { error: "Valor mínimo para PIX é R$ 1,00." },
      { status: 400 },
    );
  }

  let verifiedGamepassId: number | undefined;

  if (item.type === "robux" && item.robuxAmount) {
    const requiredPrice = gamepassPriceForNetRobux(item.robuxAmount);
    try {
      const detection = await findMatchingGamepass({
        userId: profile.id,
        requiredPrice,
      });

      if (
        !detection.matched ||
        (parsed.data.robloxGamepassId &&
          detection.matched.id !== parsed.data.robloxGamepassId)
      ) {
        return NextResponse.json(
          {
            error: `Gamepass de ${requiredPrice.toLocaleString("pt-BR")} Robux ainda não encontrada na sua conta.`,
          },
          { status: 400 },
        );
      }

      verifiedGamepassId = detection.matched.id;
    } catch {
      return NextResponse.json(
        { error: "Não foi possível validar a gamepass agora." },
        { status: 502 },
      );
    }
  }

  const orderId = createOrderId();
  const viewToken = createOrderViewToken();
  const now = new Date().toISOString();
  const gatewayPayer = gatewayPayerFromUsername(profile.name);
  const session = await getSession();

  try {
    const pix = await createPixTransaction({
      amount: item.amountBrl,
      payerName: gatewayPayer.payerName,
      payerDocument: gatewayPayer.payerDocument,
      transactionId: orderId,
      description: `Hollow — ${item.productLabel} @${profile.name}`,
    });

    const order: Order = {
      id: orderId,
      type: item.type,
      productLabel: item.productLabel,
      amountBrl: item.amountBrl,
      robuxAmount: item.robuxAmount,
      gamepassId: item.gamepassId,
      customGameName: item.customGameName,
      customGamepassName: item.customGamepassName,
      robloxGamepassId: verifiedGamepassId,
      robloxUserId: profile.id,
      robloxUsername: profile.name,
      accountUserId: session?.sub,
      viewToken,
      payerName: gatewayPayer.payerName,
      payerDocument: gatewayPayer.payerDocument,
      status: normalizePaymentStatus(pix.transactionState),
      adminStatus: "AGUARDANDO",
      transactionId: pix.transactionId,
      copyPaste: pix.copyPaste,
      qrCodeBase64: pix.qrCodeBase64,
      qrcodeUrl: pix.qrcodeUrl,
      createdAt: now,
      updatedAt: now,
    };

    await saveOrder(order);

    void import("@/lib/discord/bot")
      .then(({ notifyOrderCreated }) => notifyOrderCreated(order))
      .catch((error) => {
        console.error("[discord] Falha ao notificar pedido:", error);
      });

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        status: order.status,
        adminStatus: order.adminStatus,
        productLabel: order.productLabel,
        amountBrl: order.amountBrl,
        amountFormatted: formatBrl(order.amountBrl),
        robloxUsername: order.robloxUsername,
        copyPaste: order.copyPaste,
        qrCodeBase64: order.qrCodeBase64,
        qrcodeUrl: order.qrcodeUrl,
        viewToken: order.viewToken,
      },
    });
  } catch (error) {
    // Fallback para erro 409 da SevenPay (Idempotency-Key já reservada):
    // recupera o pedido pendente recente do mesmo usuário/valor em vez de falhar.
    const errMsg = error instanceof Error ? error.message : "";
    if (errMsg.includes("Idempotency-Key") || errMsg.includes("reservado")) {
      console.log("[checkout] Erro 409 detectado, buscando pedido pendente recente como fallback", {
        accountUserId: session?.sub,
        amountBrl: item.amountBrl,
      });

      const existing = session?.sub
        ? await findRecentPendingOrder(session.sub, item.amountBrl)
        : null;

      if (existing && existing.copyPaste) {
        console.log("[checkout] Fallback 409: recuperando pedido existente", {
          orderId: existing.id,
          transactionId: existing.transactionId,
        });

        return NextResponse.json({
          ok: true,
          reused: true,
          order: {
            id: existing.id,
            status: existing.status,
            adminStatus: existing.adminStatus,
            productLabel: existing.productLabel,
            amountBrl: existing.amountBrl,
            amountFormatted: formatBrl(existing.amountBrl),
            robloxUsername: existing.robloxUsername,
            copyPaste: existing.copyPaste,
            qrCodeBase64: existing.qrCodeBase64,
            qrcodeUrl: existing.qrcodeUrl,
            viewToken: existing.viewToken,
          },
        });
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível gerar o PIX. Tente novamente.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
