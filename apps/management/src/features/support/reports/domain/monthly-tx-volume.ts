import { TRANSACTIONS } from '@/mocks/transactions';

const MS_DAY = 86_400_000;

/** Son 30 takvim günü tamamlanan TRY işlemlerinin ortalama tutarı */
export function computeMonthlyAvgVolumeTry(
  entityNo: string,
  entityKind: 'customer' | 'agent',
  at: Date = new Date('2026-05-24T12:00:00Z'),
): number {
  const id = Number(entityNo.replace(/^AG-/i, ''));
  if (!Number.isFinite(id) || id <= 0) return 0;

  const windowStart = at.getTime() - 30 * MS_DAY;
  const amounts: number[] = [];

  for (const tx of TRANSACTIONS) {
    if (tx.recordStatus !== 1 || tx.status !== 'Completed' || tx.currency !== 'TRY') continue;
    const created = new Date(tx.createdAt).getTime();
    if (created < windowStart || created > at.getTime()) continue;

    const involved =
      entityKind === 'customer'
        ? tx.senderCustomerId === id || tx.receiverCustomerId === id
        : tx.senderAgentId === id || tx.receiverAgentId === id;
    if (involved) amounts.push(tx.amount);
  }

  if (amounts.length === 0) return 0;
  return Math.round(amounts.reduce((s, a) => s + a, 0) / amounts.length);
}
