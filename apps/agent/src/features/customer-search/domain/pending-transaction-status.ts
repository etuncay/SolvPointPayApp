import type { TransactionStatus } from '@/features/transaction-confirmation/domain/transaction-types';
import { isTerminalStatus } from '@/features/transaction-confirmation/domain/transaction-types';

/** Bekleyen işlem — sonlanmamış durumlar. */
export function isPendingTransactionStatus(status: TransactionStatus): boolean {
  return !isTerminalStatus(status);
}
