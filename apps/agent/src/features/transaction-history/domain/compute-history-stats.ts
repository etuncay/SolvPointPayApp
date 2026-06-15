import type { AgentTransactionRow } from './types';

const RATE_TO_TRY: Record<string, number> = { TRY: 1, USD: 34.5, EUR: 37, GBP: 43 };

const PENDING_STATUSES = new Set(['Pending', 'Sent', 'OnHold', 'Retrying']);

export type TransactionHistoryStats = {
  count: number;
  volumeTry: number;
  totalRevenueTry: number;
  pendingCount: number;
};

export function computeHistoryStats(rows: AgentTransactionRow[]): TransactionHistoryStats {
  let volumeTry = 0;
  let totalRevenueTry = 0;
  let pendingCount = 0;

  for (const row of rows) {
    const rate = RATE_TO_TRY[row.currency] ?? 1;
    volumeTry += row.amount * rate;
    totalRevenueTry += row.totalRevenueTry ?? 0;
    if (PENDING_STATUSES.has(row.status)) pendingCount += 1;
  }

  return {
    count: rows.length,
    volumeTry: Math.round(volumeTry),
    totalRevenueTry: Math.round(totalRevenueTry),
    pendingCount,
  };
}

/** Durum sekmesi sayıları — tarih kapsamına göre taban küme üzerinden. */
export function computeStatusTabCounts(rows: AgentTransactionRow[]): Record<string, number> {
  const rejected = (r: AgentTransactionRow) =>
    r.status === 'Canceled' ||
    r.status === 'ErrorComplete' ||
    r.status === 'ErrorSend' ||
    r.status === 'ErrorReceive';

  return {
    countAll: rows.length,
    countCompleted: rows.filter((r) => r.status === 'Completed').length,
    countPending: rows.filter((r) => r.status === 'Pending').length,
    countSent: rows.filter((r) => r.status === 'Sent').length,
    countOnHold: rows.filter((r) => r.status === 'OnHold').length,
    countRejected: rows.filter(rejected).length,
  };
}
