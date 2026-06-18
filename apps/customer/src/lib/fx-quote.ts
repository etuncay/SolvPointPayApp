export const FX_QUOTE_TTL_MS = 90_000;

export function fxQuoteSecondsLeft(expiresAtMs: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((expiresAtMs - now) / 1000));
}

export function isFxQuoteExpired(expiresAtMs: number | null, now = Date.now()): boolean {
  if (expiresAtMs == null) return false;
  return now >= expiresAtMs;
}
