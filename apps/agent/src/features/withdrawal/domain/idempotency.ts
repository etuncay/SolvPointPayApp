import { TRANSACTIONS } from '@/mocks/transactions';
import { agentTransactionsStore } from '@/features/transaction-confirmation/api/agent-transactions-store';

/** Aynı İşlem Referans No daha önce kullanılmış mı (mock idempotency). */
export function isDuplicateReference(referenceNo: string): boolean {
  const ref = referenceNo.trim();
  if (!ref) return false;
  if (TRANSACTIONS.some((t) => t.referenceNo === ref)) return true;
  return agentTransactionsStore.hasReference(ref);
}
