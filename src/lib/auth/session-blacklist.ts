/**
 * Blacklist de sessões revogadas (logout).
 * Em produção multi-instância, substituir por Redis/Upstash.
 * Esta implementação em memória funciona para instância única ou como fallback.
 */

const revokedSessions = new Map<string, number>(); // jti -> expiresAt (epoch ms)

/**
 * Adiciona um token JWT à blacklist até sua expiração natural.
 * @param jti Identificador único do token (ou o próprio token hash)
 * @param expiresAt Timestamp de expiração original do token (ms)
 */
export function revokeSession(jti: string, expiresAt: number): void {
  revokedSessions.set(jti, expiresAt);
}

/**
 * Verifica se um token foi revogado.
 * Limpa entradas expiradas automaticamente para evitar vazamento de memória.
 */
export function isSessionRevoked(jti: string): boolean {
  const expiresAt = revokedSessions.get(jti);
  if (expiresAt === undefined) return false;

  // Se o token já expirou naturalmente, remove da blacklist
  if (Date.now() > expiresAt) {
    revokedSessions.delete(jti);
    return false;
  }

  return true;
}

/**
 * Gera um JTI (JWT ID) determinístico a partir do token para uso na blacklist.
 * Usa os primeiros 32 chars do token como identificador (suficiente para unicidade).
 */
export function tokenToJti(token: string): string {
  return token.slice(0, 32);
}

/**
 * Limpeza periódica de entradas expiradas para prevenir memory leak.
 */
export function pruneRevokedSessions(): void {
  const now = Date.now();
  for (const [jti, expiresAt] of revokedSessions) {
    if (now > expiresAt) revokedSessions.delete(jti);
  }
}

// Auto-cleanup a cada 5 minutos
if (typeof globalThis !== "undefined") {
  const CLEANUP_INTERVAL_MS = 5 * 60_000;
  if (!(globalThis as Record<string, unknown>).__hollowSessionBlacklistCleanup) {
    (globalThis as Record<string, unknown>).__hollowSessionBlacklistCleanup = setInterval(
      () => pruneRevokedSessions(),
      CLEANUP_INTERVAL_MS,
    );
  }
}