import type { AgentTransactionSeed } from '@/features/transaction-confirmation/domain/types';
import { istanbulDayKey } from './istanbul-day';

/** Günlük grafik satırı — başarılı/başarısız adet ve tutar (İstanbul takvim günü). */
export type DailyAggRow = {
  day: string;
  label: string;
  successCount: number;
  failedCount: number;
  successAmount: number;
  failedAmount: number;
};

function dayLabel(key: string): string {
  const [, m, d] = key.split('-');
  return `${d}.${m}`;
}

/** Ham işlem kayıtlarını İstanbul takvim gününe göre kümeleyip son N günü döndürür. */
export function aggregateDaily(seeds: AgentTransactionSeed[], days = 7): DailyAggRow[] {
  const byDay = new Map<string, DailyAggRow>();

  for (const seed of seeds) {
    const key = istanbulDayKey(seed.createdAt.replace(' ', 'T'));
    const row =
      byDay.get(key) ??
      ({
        day: key,
        label: dayLabel(key),
        successCount: 0,
        failedCount: 0,
        successAmount: 0,
        failedAmount: 0,
      } satisfies DailyAggRow);

    if (seed.success) {
      row.successCount += 1;
      row.successAmount += seed.amount;
    } else {
      row.failedCount += 1;
      row.failedAmount += seed.amount;
    }
    byDay.set(key, row);
  }

  return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day)).slice(-days);
}
