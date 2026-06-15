import { istanbulToday } from './istanbul-today';
import type { AgentTransactionFilters, AgentTransactionRow } from './types';

function includesCi(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

/**
 * Spec §5 filtreleri + §8 varsayılan bugün.
 * Tarih alanları boşsa İstanbul takvim gününe sabitlenir; kullanıcı aralığı genişletebilir.
 */
const REJECTED_STATUSES = new Set(['Canceled', 'ErrorComplete', 'ErrorSend', 'ErrorReceive']);

export function applyAgentTransactionFilters(
  rows: AgentTransactionRow[],
  filters: AgentTransactionFilters,
): AgentTransactionRow[] {
  const today = istanbulToday();
  const useTodayDefault = filters.dateScope !== 'all';
  let from = filters.dateFrom?.trim() ?? '';
  let to = filters.dateTo?.trim() ?? '';
  if (useTodayDefault && !from && !to) {
    from = today;
    to = today;
  }
  const amountMin = filters.amountMin?.trim() ? Number(filters.amountMin) : null;
  const amountMax = filters.amountMax?.trim() ? Number(filters.amountMax) : null;
  const type = filters.transactionType && filters.transactionType !== 'any' ? filters.transactionType : null;
  const role = filters.agentRole && filters.agentRole !== 'any' ? filters.agentRole : null;
  const statusTab = filters.status && filters.status !== 'all' ? filters.status : null;
  const search = filters.search?.trim() ?? '';

  return rows.filter((row) => {
    const day = row.createdAt.slice(0, 10);
    if (from && to && (day < from || day > to)) return false;
    if (statusTab) {
      if (statusTab === 'Rejected') {
        if (!REJECTED_STATUSES.has(row.status)) return false;
      } else if (row.status !== statusTab) return false;
    }
    if (filters.transactionNo?.trim() && !includesCi(row.transactionNo, filters.transactionNo)) return false;
    if (type && row.transactionType !== type) return false;
    if (amountMin != null && !Number.isNaN(amountMin) && row.amount < amountMin) return false;
    if (amountMax != null && !Number.isNaN(amountMax) && row.amount > amountMax) return false;
    if (filters.sender?.trim() && !includesCi(row.senderName, filters.sender)) return false;
    if (filters.receiver?.trim() && !includesCi(row.receiverName, filters.receiver)) return false;
    if (role && row.agentRole !== role) return false;
    if (search) {
      const hit =
        includesCi(row.transactionNo, search) ||
        includesCi(row.referenceNo, search) ||
        includesCi(row.senderName, search) ||
        includesCi(row.receiverName, search) ||
        (row.iban ? includesCi(row.iban, search) : false);
      if (!hit) return false;
    }
    return true;
  });
}
