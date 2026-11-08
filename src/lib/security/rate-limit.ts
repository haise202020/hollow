type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * In-memory sliding fixed-window rate limiter.
 * For multi-instance production, replace with Redis / Upstash.
 */
export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return {
    success: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Progressive penalty for repeated failures (e.g., brute-force login).
 * Returns the additional delay in ms to apply before allowing the next attempt.
 * Tracks failures per-key with exponential backoff: 0, 1s, 2s, 4s, 8s... capped at 30s.
 */
const failureBuckets = new Map<string, { failures: number; lastFailure: number }>();
const MAX_BACKOFF_MS = 30_000;
const FAILURE_WINDOW_MS = 5 * 60_000; // reset after 5 min of no failures

export function recordAuthFailure(key: string): void {
  const now = Date.now();
  const existing = failureBuckets.get(key);

  if (!existing || now - existing.lastFailure > FAILURE_WINDOW_MS) {
    failureBuckets.set(key, { failures: 1, lastFailure: now });
    return;
  }

  existing.failures += 1;
  existing.lastFailure = now;
}

export function getAuthBackoffMs(key: string): number {
  const existing = failureBuckets.get(key);
  if (!existing) return 0;

  const now = Date.now();
  if (now - existing.lastFailure > FAILURE_WINDOW_MS) {
    failureBuckets.delete(key);
    return 0;
  }

  // Exponential backoff: 2^(failures-1) seconds, capped
  const backoff = Math.min(
    Math.pow(2, existing.failures - 1) * 1000,
    MAX_BACKOFF_MS,
  );
  return backoff;
}

export function clearAuthFailures(key: string): void {
  failureBuckets.delete(key);
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.slice(0, 64);

  return "unknown";
}

/** Periodic cleanup to avoid unbounded memory growth. */
export function pruneRateLimitBuckets(now = Date.now()) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  for (const [key, bucket] of failureBuckets) {
    if (now - bucket.lastFailure > FAILURE_WINDOW_MS) failureBuckets.delete(key);
  }
}

// Auto-cleanup every 60s to prevent memory leaks in long-running processes.
// NOTE: In serverless/Vercel environments, in-memory rate limiting resets on
// each cold start. For production multi-instance deployments, replace with
// Redis/Upstash-backed rate limiter using the same RateLimitResult interface.
if (typeof globalThis !== "undefined") {
  const CLEANUP_INTERVAL_MS = 60_000;
  if (!(globalThis as Record<string, unknown>).__hollowRateLimitCleanup) {
    (globalThis as Record<string, unknown>).__hollowRateLimitCleanup = setInterval(
      () => pruneRateLimitBuckets(),
      CLEANUP_INTERVAL_MS,
    );
  }
}
