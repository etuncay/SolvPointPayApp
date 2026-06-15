import { getActiveParameterValue } from '@/mocks/system-parameters';

type SendRecord = { at: number; address: string };

let lastGlobalAt = 0;
const perAddress: SendRecord[] = [];

const GLOBAL_MIN_MS = 1000;
const WINDOW_MS = 60 * 60 * 1000;

export function resetRateLimitState(): void {
  lastGlobalAt = 0;
  perAddress.length = 0;
}

function maxPerHour(): number {
  return getActiveParameterValue('otp.rate_limit_per_hour', 5);
}

export function checkRateLimit(address: string, now = Date.now()): string | null {
  if (now - lastGlobalAt < GLOBAL_MIN_MS) {
    return 'nt_rate_limit_exceeded';
  }
  const normalized = address.trim().toLowerCase();
  const cutoff = now - WINDOW_MS;
  const recent = perAddress.filter((r) => r.at >= cutoff && r.address === normalized);
  if (recent.length >= maxPerHour()) {
    return 'nt_rate_limit_exceeded';
  }
  return null;
}

export function recordSend(address: string, now = Date.now()): void {
  lastGlobalAt = now;
  perAddress.push({ at: now, address: address.trim().toLowerCase() });
  const cutoff = now - WINDOW_MS;
  while (perAddress.length > 0 && perAddress[0]!.at < cutoff) {
    perAddress.shift();
  }
}
