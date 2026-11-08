import { NextResponse } from "next/server";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Standardized API error response.
 * In production, strips internal validation details to avoid information leakage.
 */
export function apiError(
  message: string,
  status: number,
  options?: { details?: unknown },
): NextResponse {
  const body: Record<string, unknown> = { error: message };

  if (isDev && options?.details !== undefined) {
    body.details = options.details;
  }

  return NextResponse.json(body, { status });
}

/** Standardized success response. */
export function apiOk(data: Record<string, unknown>): NextResponse {
  return NextResponse.json({ ok: true, ...data });
}