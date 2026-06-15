import type { FraudCaseListItem } from './types';
import { priorityRank } from './priority-rank';

/** Spec §8 — öncelik ↓, tutar ↓, işlem tarihi ↑ (eski üstte) */
export function sortFraudCases(rows: FraudCaseListItem[]): FraudCaseListItem[] {
  return [...rows].sort((a, b) => {
    const pr = priorityRank(b.priority) - priorityRank(a.priority);
    if (pr !== 0) return pr;
    const amt = b.amount - a.amount;
    if (amt !== 0) return amt;
    return a.transactionDate.localeCompare(b.transactionDate);
  });
}
