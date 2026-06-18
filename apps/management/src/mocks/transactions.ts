import type { TransactionStatus, TransactionType, LedgerDirection } from '@epay/domain';
import {
  BACK_OFFICE_TRANSACTION_SEED,
  buildBackOfficeTransactions,
  countTransactionsByStatus,
  maskIban,
  type BackOfficeTransaction,
} from '@epay/data';

export type { TransactionStatus, TransactionType };
export type TransactionDirection = LedgerDirection;
export type Transaction = BackOfficeTransaction;

export { maskIban, buildBackOfficeTransactions };

/** Tek kaynak @epay/data — Dexie seed ile aynı fixture */
export const TRANSACTIONS: Transaction[] = BACK_OFFICE_TRANSACTION_SEED;

export function countByStatus(status: TransactionStatus): number {
  return countTransactionsByStatus(TRANSACTIONS, status);
}
