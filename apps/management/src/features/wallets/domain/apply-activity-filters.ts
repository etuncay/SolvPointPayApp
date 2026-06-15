import type { WalletActivity, WalletActivityFilters } from './activity-types';

export function applyActivityFilters(
  rows: WalletActivity[],
  filters: WalletActivityFilters,
): WalletActivity[] {
  const q = filters.query.trim().toLocaleLowerCase('tr-TR');
  return rows.filter((r) => {
    if (filters.direction !== 'all' && r.direction !== filters.direction) return false;
    if (filters.status !== 'all' && r.status !== filters.status) return false;
    if (filters.transactionType !== 'all' && r.transactionType !== filters.transactionType) return false;
    if (filters.currency !== 'all' && r.currency !== filters.currency) return false;
    if (filters.from && r.createdAt < filters.from) return false;
    if (filters.to && r.createdAt > filters.to) return false;
    if (q) {
      const hay = [
        r.transactionNo,
        r.referenceNo,
        String(r.counterpartyNo ?? ''),
        r.counterpartyName,
        r.counterpartyAccount,
      ]
        .join(' ')
        .toLocaleLowerCase('tr-TR');
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
