import { cookies } from "next/headers";
import { CSRF_COOKIE } from "./constants";
import { createCsrfToken, verifyCsrfToken } from "./csrf-core";

export { assertCsrf, createCsrfToken, verifyCsrfToken } from "./csrf-core";
export { CSRF_COOKIE, CSRF_HEADER } from "./constants";

export async function ensureCsrfCookie(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(CSRF_COOKIE)?.value;

  if (existing && (await verifyCsrfToken(existing))) {
    return existing;
  }

  const token = await createCsrfToken();
  jar.set(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return token;
}
