import type { FinancialReconciliation, FinancialReconciliationFilters } from './types';

export function applyFinancialReconciliationFilters(
  rows: FinancialReconciliation[],
  filters: FinancialReconciliationFilters,
): FinancialReconciliation[] {
  return rows.filter((r) => {
    if (filters.status !== 'all' && r.status !== filters.status) return false;
    if (filters.asOfFrom && r.asOfTimestamp < `${filters.asOfFrom} 00:00:00`) return false;
    if (filters.asOfTo && r.asOfTimestamp > `${filters.asOfTo} 23:59:59`) return false;
    return true;
  });
}
