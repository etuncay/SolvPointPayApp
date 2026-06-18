import type { AgentRemainingLimitResult } from '../contracts/agent-remaining-limit-port';

/** Tutar limit içinde mi — 0 kapalı, -1 limitsiz. */
export function isAmountWithinLimit(amount: number, limit: AgentRemainingLimitResult): boolean {
  const max = limit.nextTxMaxAmount;
  if (max === 0) return false;
  if (max === -1) return amount > 0;
  return amount > 0 && amount <= max;
}

export function formatLimitCap(max: number): string {
  if (max === -1) return '∞';
  return String(max);
}
