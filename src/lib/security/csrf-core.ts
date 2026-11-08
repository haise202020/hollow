import { CSRF_COOKIE, CSRF_HEADER } from "./constants";
export { CSRF_COOKIE, CSRF_HEADER };

/** Extract the CSRF cookie value from request headers without duplication. */
export function getCsrfCookieFromHeaders(headers: Headers): string | undefined {
  const cookieHeader = headers.get("cookie") ?? "";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CSRF_COOKIE}=`))
    ?.split("=")[1];
}

function getSecret(): string {
  const secret = process.env.CSRF_SECRET;
  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("CSRF_SECRET is required in production");
  }

  return "hollow-dev-csrf-secret-change-me-32chars";
}

function toHex(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(view)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function sign(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(token));
  return toHex(signature);
}

export async function createCsrfToken(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const token = toHex(bytes);
  const signature = await sign(token);
  return `${token}.${signature}`;
}

export async function verifyCsrfToken(
  token: string | null | undefined,
): Promise<boolean> {
  if (!token || !token.includes(".")) return false;

  const [value, signature] = token.split(".");
  if (!value || !signature) return false;

  const expected = await sign(value);
  return timingSafeEqualHex(signature, expected);
}

export async function assertCsrf(
  request: Request,
  cookieToken?: string,
  headerName = "x-csrf-token",
): Promise<boolean> {
  const headerToken = request.headers.get(headerName);
  if (!headerToken || !cookieToken) return false;

  const headerOk = await verifyCsrfToken(headerToken);
  const cookieOk = await verifyCsrfToken(cookieToken);
  if (!headerOk || !cookieOk) return false;

  return timingSafeEqualHex(headerToken, cookieToken);
}
