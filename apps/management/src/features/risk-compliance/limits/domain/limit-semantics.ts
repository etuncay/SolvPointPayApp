import type { InternationalTransfer, LimitValue } from './types';

/** -1 > pozitif > 0 */
export function limitPermissivenessRank(value: LimitValue): number {
  if (value === -1) return Number.POSITIVE_INFINITY;
  if (value === 0) return Number.NEGATIVE_INFINITY;
  return value;
}

/** a, b'den daha gevşek veya eşit mi */
export function isLimitMorePermissiveOrEqual(a: LimitValue, b: LimitValue): boolean {
  return limitPermissivenessRank(a) >= limitPermissivenessRank(b);
}

export function isInternationalMorePermissiveOrEqual(
  a: InternationalTransfer,
  b: InternationalTransfer,
): boolean {
  if (a === b) return true;
  return a === 'Allowed' && b === 'Forbidden';
}

/** Onay eşiği ≤ tek işlem — -1/0 istisnaları */
export function isApprovalThresholdValid(
  singleTxLimit: LimitValue,
  approvalThreshold: LimitValue,
): boolean {
  if (singleTxLimit === -1) return true;
  if (singleTxLimit === 0) return approvalThreshold === 0;
  if (approvalThreshold === -1) return false;
  if (approvalThreshold === 0) return true;
  return approvalThreshold <= singleTxLimit;
}

/** Pozitif günlük/aylık için aylık ≥ günlük */
export function isMonthlyGteDaily(daily: LimitValue, monthly: LimitValue): boolean {
  if (daily <= 0 || monthly <= 0) return true;
  if (daily === -1 || monthly === -1) return true;
  return monthly >= daily;
}
