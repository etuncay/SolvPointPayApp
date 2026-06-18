import type { LimitValue } from './limit-types';

/** -1 > pozitif > 0 */
export function limitPermissivenessRank(value: LimitValue): number {
  if (value === -1) return Number.POSITIVE_INFINITY;
  if (value === 0) return Number.NEGATIVE_INFINITY;
  return value;
}

/** En kısıtlayıcı değer: rank en küçük olan (0 en kısıtlayıcı, -1 en gevşek). */
export function mostRestrictive(values: readonly LimitValue[]): LimitValue {
  if (values.length === 0) return -1;
  return values.reduce((acc, v) =>
    limitPermissivenessRank(v) < limitPermissivenessRank(acc) ? v : acc,
  );
}

/** Kalan = limit<=0 ? limit : max(0, limit - kullanım). */
export function remainingForLimit(limit: LimitValue, used: number): LimitValue {
  if (limit <= 0) return limit;
  return Math.max(0, limit - Math.max(0, used));
}
