import type { Wallet } from './types';
import type { WalletFilters } from './types';

/** Liste filtreleri — page mantığı adapter'a taşındı */
export function applyWalletFilters(rows: Wallet[], filters: WalletFilters): Wallet[] {
  const q = filters.query.trim().toLocaleLowerCase('tr-TR');
  return rows.filter((w) => {
    if (filters.cat !== 'all' && w.cat !== filters.cat) return false;
    if (filters.ccy !== 'all' && w.ccy !== filters.ccy) return false;
    if (filters.type !== 'any' && w.type !== filters.type) return false;
    if (filters.state === 'full' && w.blocked !== -1) return false;
    if (filters.state === 'partial' && !(w.blocked > 0 && w.blocked !== -1)) return false;
    if (filters.state === 'negative' && !(w.balance < 0)) return false;
    if (filters.state === 'normal' && (w.blocked !== 0 || w.balance < 0)) return false;
    if (filters.from && w.createdAt < filters.from) return false;
    if (filters.to && w.createdAt > filters.to) return false;
    if (q) {
      const hay = [
        String(w.ownerNo ?? ''),
        w.walletNo,
        w.ownerName,
        w.phone ?? '',
        w.idNo ?? '',
        String(w.customerId ?? ''),
        String(w.agentId ?? ''),
      ]
        .join(' ')
        .toLocaleLowerCase('tr-TR');
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
