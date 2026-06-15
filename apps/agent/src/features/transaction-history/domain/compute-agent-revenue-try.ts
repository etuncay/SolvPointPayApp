import type { Transaction } from '@/mocks/transactions';

/** Mock kur tablosu — gelir TRY'ye çevrilirken kullanılır (gerçek API'de fx servisinden gelir). */
const RATE_TO_TRY: Record<string, number> = { TRY: 1, USD: 34.5, EUR: 37, GBP: 43 };

/** §19 — gelir yalnızca gerçekleşmiş (terminal başarılı) işlemlerde hesaplanır. */
const REALIZED_STATUSES = new Set(['Completed', 'Sent']);

/**
 * Temsilci geliri (TRY) — sabit + oransal ücret toplamının TRY karşılığı.
 * İade/iptal/hata veya henüz tamamlanmamış işlemlerde null döner ("—" gösterilir).
 */
export function computeAgentRevenueTry(tx: Transaction): number | null {
  if (!REALIZED_STATUSES.has(tx.status)) return null;
  const feeFixed = tx.feeFixed ?? Math.max(5, Math.round(tx.amount * 0.01));
  const feeVariable = tx.feeVariable ?? Math.max(0, Math.round(tx.amount * 0.005));
  const rate = RATE_TO_TRY[tx.currency] ?? 1;
  return Math.round((feeFixed + feeVariable) * rate);
}
