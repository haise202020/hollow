const MISTICPAY_BASE = "https://api.misticpay.com/api";

export type MisticCreateResult = {
  transactionId: string;
  transactionState: string;
  transactionAmount: number;
  qrCodeBase64?: string;
  qrcodeUrl?: string;
  copyPaste?: string;
};

export type MisticCheckResult = {
  transactionId: string;
  transactionState: string;
  value: number;
};

function getCredentials() {
  const ci = process.env.MISTICPAY_CLIENT_ID?.trim();
  const cs = process.env.MISTICPAY_CLIENT_SECRET?.trim();

  if (!ci || !cs) {
    throw new Error("Credenciais MisticPay não configuradas.");
  }

  return { ci, cs };
}

function authHeaders() {
  const { ci, cs } = getCredentials();
  return {
    ci,
    cs,
    "Content-Type": "application/json",
  };
}

export function buildWebhookUrl(): string | undefined {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!site) return undefined;

  const secret = process.env.MISTICPAY_WEBHOOK_SECRET?.trim();
  const base = `${site}/api/webhooks/misticpay`;
  return secret ? `${base}?secret=${encodeURIComponent(secret)}` : base;
}

export async function createPixTransaction(input: {
  amount: number;
  payerName: string;
  payerDocument: string;
  transactionId: string;
  description: string;
}): Promise<MisticCreateResult> {
  const webhook = buildWebhookUrl();

  const response = await fetch(`${MISTICPAY_BASE}/transactions/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      amount: input.amount,
      payerName: input.payerName,
      payerDocument: input.payerDocument,
      transactionId: input.transactionId,
      description: input.description,
      ...(webhook ? { projectWebhook: webhook } : {}),
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        message?: string;
        error?: string;
        data?: {
          transactionId?: string | number;
          transactionState?: string;
          transactionAmount?: number;
          qrCodeBase64?: string;
          qrcodeUrl?: string;
          copyPaste?: string;
        };
      }
    | null;

  if (!response.ok || !payload?.data?.transactionId) {
    const message =
      payload?.message ||
      payload?.error ||
      `Falha ao criar cobrança PIX (${response.status}).`;
    throw new Error(message);
  }

  return {
    transactionId: String(payload.data.transactionId),
    transactionState: payload.data.transactionState ?? "PENDENTE",
    transactionAmount: Number(payload.data.transactionAmount ?? input.amount),
    qrCodeBase64: payload.data.qrCodeBase64,
    qrcodeUrl: payload.data.qrcodeUrl,
    copyPaste: payload.data.copyPaste,
  };
}

export async function checkPixTransaction(
  transactionId: string,
): Promise<MisticCheckResult> {
  const response = await fetch(`${MISTICPAY_BASE}/transactions/check`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ transactionId }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        message?: string;
        error?: string;
        transaction?: {
          transactionId?: string | number;
          transactionState?: string;
          value?: number;
        };
      }
    | null;

  if (!response.ok || !payload?.transaction) {
    const message =
      payload?.message ||
      payload?.error ||
      `Falha ao consultar transação (${response.status}).`;
    throw new Error(message);
  }

  return {
    transactionId: String(payload.transaction.transactionId ?? transactionId),
    transactionState: String(payload.transaction.transactionState ?? "PENDENTE"),
    value: Number(payload.transaction.value ?? 0),
  };
}

export function normalizePaymentStatus(
  state: string,
): "PENDENTE" | "COMPLETO" | "FALHA" | "CANCELADO" {
  const value = state.toUpperCase();
  if (value === "COMPLETO" || value === "COMPLETED" || value === "PAID") {
    return "COMPLETO";
  }
  if (value === "FALHA" || value === "FAILED" || value === "REJECTED") {
    return "FALHA";
  }
  if (value === "CANCELADO" || value === "CANCELLED" || value === "CANCELED") {
    return "CANCELADO";
  }
  return "PENDENTE";
}
