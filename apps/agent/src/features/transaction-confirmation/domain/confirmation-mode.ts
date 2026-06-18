import type { TransactionDetail } from './transaction-detail';
import type { ConfirmationMode } from './types';

/** Risk=Kritik eşiği — beyan modalını tetikler (mock: yurt dışı veya yüksek tutar). */
const CRITICAL_AMOUNT = 50_000;

/** §8 — onay anında İşlem Beyanı modalı gerektiren risk seviyesi. */
export function isCriticalRisk(detail: TransactionDetail): boolean {
  if (detail.transactionType === 'InternationalTransfer') return true;
  return detail.principalAmount >= CRITICAL_AMOUNT;
}

/**
 * Mod çözümü: Onay Modu yalnızca rota onay isterse ve işlem `Pending` ise.
 * Aksi halde (terminal/listeden açılış) Detay Modu.
 */
export function resolveConfirmationMode(
  status: TransactionDetail['status'],
  requestApprove: boolean,
  options?: { storeBacked?: boolean },
): ConfirmationMode {
  const storeBacked = options?.storeBacked ?? true;
  if (requestApprove && storeBacked && status === 'Pending') return 'Approve';
  return 'Detail';
}
