import { getTransactionsStoreSnapshot } from '@/features/transfers/api/mock-transactions-adapter';
import { CUSTOMERS, DAILY_VOLUME, NEW_CUSTOMERS_30D, TOP_AGENTS, TOP_CUSTOMERS } from '@/mocks/data';
import { isOnIstanbulDay, istanbulHour, startOfIstanbulDay } from '../domain/istanbul-day';
import { toTry } from '../domain/try-convert';
import type { DailyVolumeHour, NewCustomerDay, TopAgentRow, TopCustomerRow } from '../domain/types';

const SUCCESS: Set<string> = new Set(['Completed', 'Sent']);
const FAILED: Set<string> = new Set(['ErrorComplete', 'Canceled', 'ErrorSend', 'ErrorReceive']);

export function projectDailyVolume(): DailyVolumeHour[] {
  const hours: DailyVolumeHour[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    success: 0,
    failed: 0,
    amount: 0,
  }));

  const txs = getTransactionsStoreSnapshot().filter(
    (t) => t.recordStatus === 1 && isOnIstanbulDay(t.createdAt),
  );

  if (txs.length === 0) {
    return DAILY_VOLUME.map((r) => ({ ...r }));
  }

  for (const tx of txs) {
    const h = istanbulHour(tx.createdAt);
    const bucket = hours[h]!;
    const tryAmount = toTry(tx.amount, tx.currency);
    bucket.amount += tryAmount;
    if (SUCCESS.has(tx.status)) bucket.success += 1;
    else if (FAILED.has(tx.status)) bucket.failed += 1;
  }

  return hours;
}

export function projectNewCustomers30d(): NewCustomerDay[] {
  const today = startOfIstanbulDay();
  const counts = new Map<number, number>();

  for (const c of CUSTOMERS) {
    const created = new Date(c.createdAt);
    const diffDays = Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0 || diffDays > 29) continue;
    counts.set(diffDays, (counts.get(diffDays) ?? 0) + 1);
  }

  if (counts.size === 0) {
    return NEW_CUSTOMERS_30D.map((r) => ({ day: r.day, count: r.count }));
  }

  return Array.from({ length: 30 }, (_, day) => ({
    day,
    count: counts.get(day) ?? 0,
  }));
}

type Agg = { sent: number; received: number; txCount: number; name: string; id?: string };

export function projectTopCustomersToday(): TopCustomerRow[] {
  const agg = new Map<number, Agg>();
  const txs = getTransactionsStoreSnapshot().filter(
    (t) => t.recordStatus === 1 && isOnIstanbulDay(t.createdAt) && SUCCESS.has(t.status),
  );

  for (const tx of txs) {
    const amount = toTry(tx.amount, tx.currency);
    if (tx.senderCustomerId != null) {
      const cur = agg.get(tx.senderCustomerId) ?? {
        sent: 0,
        received: 0,
        txCount: 0,
        name: CUSTOMERS.find((c) => c.id === tx.senderCustomerId)?.name ?? '—',
      };
      cur.sent += amount;
      cur.txCount += 1;
      agg.set(tx.senderCustomerId, cur);
    }
    if (tx.receiverCustomerId != null) {
      const cur = agg.get(tx.receiverCustomerId) ?? {
        sent: 0,
        received: 0,
        txCount: 0,
        name: CUSTOMERS.find((c) => c.id === tx.receiverCustomerId)?.name ?? '—',
      };
      cur.received += amount;
      cur.txCount += 1;
      agg.set(tx.receiverCustomerId, cur);
    }
  }

  const ranked = [...agg.entries()]
    .map(([id, v]) => ({ id, ...v, score: v.sent + v.received }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  if (ranked.length === 0) {
    return TOP_CUSTOMERS.map((r) => ({
      rank: r.rank,
      name: r.name,
      id: r.id,
      sent: r.sent,
      received: r.received,
      withdrawn: r.withdrawn,
      txCount: r.txCount,
    }));
  }

  return ranked.map((r, i) => ({
    rank: i + 1,
    name: r.name,
    id: `MUS-${String(r.id).padStart(7, '0')}`,
    sent: Math.round(r.sent),
    received: Math.round(r.received),
    withdrawn: 0,
    txCount: r.txCount,
  }));
}

export function projectTopAgentsToday(): TopAgentRow[] {
  const agg = new Map<number, Agg & { paid: number }>();
  const txs = getTransactionsStoreSnapshot().filter(
    (t) => t.recordStatus === 1 && isOnIstanbulDay(t.createdAt) && SUCCESS.has(t.status),
  );

  for (const tx of txs) {
    const amount = toTry(tx.amount, tx.currency);
    if (tx.receiverAgentId != null) {
      const receiverId =
        typeof tx.receiverAgentId === 'number' ? tx.receiverAgentId : Number(tx.receiverAgentId);
      if (!Number.isFinite(receiverId)) continue;
      const cur = agg.get(receiverId) ?? {
        sent: 0,
        received: 0,
        paid: 0,
        txCount: 0,
        name: `Temsilci ${receiverId}`,
      };
      cur.received += amount;
      cur.txCount += 1;
      agg.set(receiverId, cur);
    }
    if (tx.senderAgentId != null) {
      const senderId =
        typeof tx.senderAgentId === 'number' ? tx.senderAgentId : Number(tx.senderAgentId);
      if (!Number.isFinite(senderId)) continue;
      const cur = agg.get(senderId) ?? {
        sent: 0,
        received: 0,
        paid: 0,
        txCount: 0,
        name: `Temsilci ${senderId}`,
      };
      cur.paid += amount;
      cur.txCount += 1;
      agg.set(senderId, cur);
    }
  }

  const ranked = [...agg.values()]
    .map((v) => ({ ...v, score: v.received + v.paid }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  if (ranked.length === 0) {
    return TOP_AGENTS.map((r) => ({
      rank: r.rank,
      name: r.name,
      id: r.id,
      received: r.received,
      paid: r.paid,
      txCount: r.txCount,
    }));
  }

  return ranked.map((r, i) => ({
    rank: i + 1,
    name: r.name,
    received: Math.round(r.received),
    paid: Math.round(r.paid),
    txCount: r.txCount,
  }));
}
