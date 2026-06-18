import { agentTransactionsStore } from '@/features/transaction-confirmation/api/agent-transactions-store';
import type { Transaction } from '@/mocks/transactions';

const COMPLETED_STATUSES = new Set(['Completed', 'Sent']);

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function agentScopedAmount(tx: Transaction, agentId: number | string): number {
  const id = Number(agentId);
  if (tx.senderAgentId === id || tx.receiverAgentId === id) return tx.amount;
  return 0;
}

/** Mock: tamamlanmış temsilci işlemlerinden günlük/aylık kullanım (onay bekleyenler hariç). */
export function sumAgentScopedUsage(
  agentId: number | string,
  asOf: Date,
  currency?: string,
): { dailyUsed: number; monthlyUsed: number } {
  let dailyUsed = 0;
  let monthlyUsed = 0;

  for (const tx of agentTransactionsStore.list()) {
    if (!COMPLETED_STATUSES.has(tx.status)) continue;
    if (currency && tx.currency !== currency) continue;
    const amount = agentScopedAmount(tx, agentId);
    if (amount <= 0) continue;

    const created = new Date(tx.createdAt.replace(' ', 'T'));
    if (isSameDay(created, asOf)) dailyUsed += amount;
    if (isSameMonth(created, asOf)) monthlyUsed += amount;
  }

  return { dailyUsed, monthlyUsed };
}
