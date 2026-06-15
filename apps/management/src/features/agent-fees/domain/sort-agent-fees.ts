import type { AgentFee } from './types';

/** Spec §5 — grup → işlem → para birimi → alt limit */
export function sortAgentFees(items: AgentFee[]): AgentFee[] {
  return [...items].sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === 'Active') return -1;
      if (b.status === 'Active') return 1;
    }
    if (a.groupCode !== b.groupCode) {
      return a.groupCode.localeCompare(b.groupCode);
    }
    if (a.transactionType !== b.transactionType) {
      return a.transactionType.localeCompare(b.transactionType);
    }
    if (a.currency !== b.currency) {
      return a.currency.localeCompare(b.currency);
    }
    if (a.lowerLimit !== b.lowerLimit) {
      return a.lowerLimit - b.lowerLimit;
    }
    return b.changedAt.localeCompare(a.changedAt);
  });
}
