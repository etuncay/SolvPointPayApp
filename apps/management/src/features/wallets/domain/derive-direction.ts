import type { TransactionDirection } from './activity-types';

/** Spec §8 — bakiye etkisine göre yön; movement.direction öncelikli */
export function deriveDirection(
  direction: TransactionDirection | null | undefined,
  prevBalance: number | null,
  postBalance: number,
): TransactionDirection {
  if (direction === 'Inflow' || direction === 'Outflow') return direction;
  if (prevBalance != null) {
    if (postBalance > prevBalance) return 'Inflow';
    if (postBalance < prevBalance) return 'Outflow';
  }
  return 'Outflow';
}
