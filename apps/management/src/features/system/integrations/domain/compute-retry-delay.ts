import type { RetryPolicy } from './types';

/** §8 — yeniden deneme gecikmesi (ms) */
export function computeRetryDelayMs(
  policy: RetryPolicy,
  attempt: number,
  fixedDelayMs = 1000,
  capMs = 16_000,
): number {
  if (attempt < 1) return fixedDelayMs;
  if (policy === 'FixedDelay') return fixedDelayMs;
  const exp = fixedDelayMs * 2 ** (attempt - 1);
  return Math.min(exp, capMs);
}
