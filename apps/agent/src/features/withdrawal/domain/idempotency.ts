import { TRANSACTIONS } from '@/mocks/transactions';
import { agentTransactionsStore } from '@/features/transaction-confirmation/api/agent-transactions-store';

const inFlightRefs = new Set<string>();

/** Test sıfırlama — in-flight referans kilidi. */
export function resetWithdrawalIdempotencyForTests(): void {
  inFlightRefs.clear();
}

/** Aynı İşlem Referans No daha önce kullanılmış mı (mock idempotency). */
export function isDuplicateReference(referenceNo: string): boolean {
  const ref = referenceNo.trim();
  if (!ref) return false;
  if (TRANSACTIONS.some((t) => t.referenceNo === ref)) return true;
  return agentTransactionsStore.hasReference(ref);
}

/**
 * Çift tıklama / eşzamanlı submit — referansı işlem süresince rezerve eder.
 * Boş referans (sunucunun üreteceği) için her zaman true.
 */
export function tryAcquireReference(referenceNo: string): boolean {
  const ref = referenceNo.trim();
  if (!ref) return true;
  if (isDuplicateReference(ref) || inFlightRefs.has(ref)) return false;
  inFlightRefs.add(ref);
  return true;
}

export function releaseReference(referenceNo: string): void {
  const ref = referenceNo.trim();
  if (ref) inFlightRefs.delete(ref);
}
