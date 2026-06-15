import type { TransactionFilters, TransactionListItem } from './types';

export function applyTransactionFilters(
  rows: TransactionListItem[],
  filters: TransactionFilters,
): TransactionListItem[] {
  const q = filters.query.trim().toLocaleLowerCase('tr-TR');
  return rows.filter((r) => {
    if (filters.status !== 'all' && r.status !== filters.status) return false;
    if (filters.transactionType !== 'all' && r.transactionType !== filters.transactionType) return false;
    if (filters.sourceCurrency !== 'all' && r.sourceCurrency !== filters.sourceCurrency) return false;
    if (filters.from && r.createdAt < filters.from) return false;
    if (filters.to && r.createdAt > filters.to) return false;
    if (filters.senderAgentNo && String(r.senderAgentNo ?? '') !== filters.senderAgentNo) return false;
    if (filters.receiverAgentNo && String(r.receiverAgentNo ?? '') !== filters.receiverAgentNo) return false;
    if (q) {
      const hay = [
        r.transactionNo,
        String(r.senderCustomerNo ?? ''),
        String(r.receiverCustomerNo ?? ''),
        r.senderWalletNo ?? '',
        r.receiverWalletNo ?? '',
        r.senderName,
        r.receiverName,
        r.iban ?? '',
      ]
        .join(' ')
        .toLocaleLowerCase('tr-TR');
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
