import crypto from "node:crypto";

const SEVENPAY_BASE = "https://api.sevenpay.ltda";

export type SevenPayCreateResult = {
  transactionId: string;
  transactionState: string;
  transactionAmount: number;
  qrCodeBase64?: string;
  qrcodeUrl?: string;
  copyPaste?: string;
};

export type SevenPayCheckResult = {
  transactionId: string;
  transactionState: string;
  value: number;
};

function getApiKey(): string {
  const key = process.env.SEVENPAY_API_KEY?.trim();
  if (!key) {
    throw new Error("SEVENPAY_API_KEY não configurada.");
  }
  return key;
}

export async function createPixTransaction(input: {
  amount: number;
  payerName: string;
  payerDocument: string;
  transactionId: string;
  description: string;
}): Promise<SevenPayCreateResult> {
  const apiKey = getApiKey();

  const requestBody = {
    amount: input.amount,
    description: input.description,
  };

  // 409 NÃO é retryable: significa que a SevenPay já reservou a cobrança
// internamente. Retentar com nova chave cria duplicatas; o correto é
// consultar o status da transação existente via checkPixTransaction.
const RETRYABLE_STATUSES = new Set([500, 502, 503]);
  const MAX_RETRIES = 3;
  const BASE_DELAY_MS = 1000;

  let response: Response | null = null;
  let lastNetworkError: string | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // Gerar UUID novo a CADA tentativa para evitar conflito 409:
    // se a SevenPay reservou a chave mas não retornou resposta válida,
    // reusar a mesma chave causa "já foi reservado localmente".
    const idempotencyKey = crypto.randomUUID();

    if (attempt > 0) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(`[sevenpay] Retry ${attempt}/${MAX_RETRIES} após ${delay}ms (nova key: ${idempotencyKey})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    console.log("[sevenpay] Criando cobrança:", {
      amount: input.amount,
      idempotencyKey,
      attempt: attempt + 1,
      endpoint: `${SEVENPAY_BASE}/deposito`,
    });

    try {
      response = await fetch(`${SEVENPAY_BASE}/deposito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });

      if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
        const retryText = await response.text().catch(() => "");
        console.warn(
          `[sevenpay] Status ${response.status} na tentativa ${attempt + 1}, tentando novamente...`,
          { body: retryText.slice(0, 200) },
        );
        continue;
      }

      break;
    } catch (fetchError) {
      lastNetworkError =
        fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error(
        `[sevenpay] Erro de rede na tentativa ${attempt + 1}:`,
        lastNetworkError,
      );

      if (attempt === MAX_RETRIES) {
        throw new Error(
          `Não foi possível conectar à SevenPay após ${MAX_RETRIES + 1} tentativas: ${lastNetworkError}. Tente novamente em instantes.`,
        );
      }
    }
  }

  if (!response) {
    throw new Error(
      `Não foi possível conectar à SevenPay: ${lastNetworkError ?? "erro desconhecido"}. Tente novamente em instantes.`,
    );
  }

  const rawText = await response.text().catch(() => "");
  let payload: {
    success?: boolean;
    message?: string;
    error?: string;
    data?: {
      id?: string;
      pix_code?: string;
      payment_url?: string;
      net_amount?: number;
      status?: string;
      qr_code_base64?: string;
    };
  } | null = null;

  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    payload = null;
  }

  console.log("[sevenpay] Resposta /deposito:", {
    status: response.status,
    hasDataId: Boolean(payload?.data?.id),
    message: payload?.message,
    error: payload?.error,
  });

  if (!response.ok || !payload?.data?.id) {
    const apiMessage = payload?.message || payload?.error;
    const fallback = rawText.slice(0, 300) || `HTTP ${response.status}`;
    console.error("[sevenpay] Falha na criação do PIX:", {
      status: response.status,
      apiMessage,
      rawBody: fallback,
    });
    throw new Error(
      apiMessage ||
        `Falha ao criar cobrança PIX (${response.status}): ${fallback}`,
    );
  }

  return {
    transactionId: String(payload.data.id),
    transactionState: normalizePaymentStatus(payload.data.status ?? "waiting"),
    transactionAmount: Number(payload.data.net_amount ?? input.amount),
    copyPaste: payload.data.pix_code,
    qrcodeUrl: payload.data.payment_url,
    qrCodeBase64: payload.data.qr_code_base64,
  };
}

export async function checkPixTransaction(
  transactionId: string,
): Promise<SevenPayCheckResult> {
  const apiKey = getApiKey();

  const response = await fetch(`${SEVENPAY_BASE}/status/deposito`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({ pixId: transactionId }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    error?: string;
    status?: string;
    amount?: number;
    paid_at?: string;
  } | null;

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Falha ao consultar transação (${response.status}).`;
    throw new Error(message);
  }

  return {
    transactionId,
    transactionState: normalizePaymentStatus(payload?.status ?? "waiting"),
    value: Number(payload?.amount ?? 0),
  };
}

export function normalizePaymentStatus(
  state: string,
): "PENDENTE" | "COMPLETO" | "FALHA" | "CANCELADO" {
  const value = state.toUpperCase();
  if (value === "VERIFIED" || value === "PAID" || value === "COMPLETED") {
    return "COMPLETO";
  }
  if (value === "REFUNDED" || value === "REJECTED" || value === "FAILED") {
    return "FALHA";
  }
  if (value === "EXPIRED" || value === "CANCELLED" || value === "CANCELED") {
    return "CANCELADO";
  }
  return "PENDENTE";
}