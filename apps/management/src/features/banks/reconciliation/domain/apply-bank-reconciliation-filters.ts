import type { BankReconciliation, BankReconciliationFilters } from './types';

export function applyBankReconciliationFilters(
  rows: BankReconciliation[],
  filters: BankReconciliationFilters,
): BankReconciliation[] {
  const q = filters.query.trim().toLocaleLowerCase('tr-TR');
  return rows.filter((r) => {
    if (r.recordStatus !== 1) return false;
    if (filters.bank !== 'all' && r.bank !== filters.bank) return false;
    if (filters.status !== 'all' && r.status !== filters.status) return false;
    if (filters.reconciliationFrom && r.reconciliationDate < `${filters.reconciliationFrom} 00:00:00`) {
      return false;
    }
    if (filters.reconciliationTo && r.reconciliationDate > `${filters.reconciliationTo} 23:59:59`) {
      return false;
    }
    if (!q) return true;
    const hay = [r.bank, r.referenceNo, r.caseNo ?? '', r.transactionType]
      .join(' ')
      .toLocaleLowerCase('tr-TR');
    return hay.includes(q);
  });
}
