import type { BankAccountMovement, BankMovementFilters } from './types';

export function applyBankMovementFilters(
  rows: BankAccountMovement[],
  filters: BankMovementFilters,
): BankAccountMovement[] {
  const q = filters.query.trim().toLocaleLowerCase('tr-TR');
  const amountMin = filters.amountMin.trim() ? Number(filters.amountMin) : null;
  const amountMax = filters.amountMax.trim() ? Number(filters.amountMax) : null;

  return rows.filter((r) => {
    if (r.recordStatus !== 1) return false;
    if (filters.paymentStatus !== 'all' && r.paymentStatus !== filters.paymentStatus) return false;
    if (filters.bankTransferMethod !== 'all' && r.bankTransferMethod !== filters.bankTransferMethod) {
      return false;
    }
    if (filters.currency !== 'all' && r.currency !== filters.currency) return false;
    if (amountMin != null && !Number.isNaN(amountMin) && r.amount < amountMin) return false;
    if (amountMax != null && !Number.isNaN(amountMax) && r.amount > amountMax) return false;
    if (filters.transactionFrom && r.transactionDate < `${filters.transactionFrom} 00:00:00`) {
      return false;
    }
    if (filters.transactionTo && r.transactionDate > `${filters.transactionTo} 23:59:59`) {
      return false;
    }
    if (!q) return true;
    const hay = [
      r.sourceBank,
      r.targetBank,
      r.sourceIban,
      r.targetIban,
      r.referenceNo,
      r.name,
      r.taxNo,
      r.bankTransactionNo,
      r.description ?? '',
    ]
      .join(' ')
      .toLocaleLowerCase('tr-TR');
    return hay.includes(q);
  });
}
