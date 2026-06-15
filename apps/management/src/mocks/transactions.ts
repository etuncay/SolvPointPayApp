import type { TransactionStatus, TransactionType, LedgerDirection } from '@epay/domain';
import {
  buildBackOfficeTransactions,
  countTransactionsByStatus,
  maskIban,
  type BackOfficeTransaction,
} from '@epay/data';
import { CUSTOMERS, TOP_AGENTS } from './data';
import { WALLETS } from './wallets';

export type { TransactionStatus, TransactionType };
export type TransactionDirection = LedgerDirection;
export type Transaction = BackOfficeTransaction;

export { maskIban, buildBackOfficeTransactions };

export const TRANSACTIONS: Transaction[] = buildBackOfficeTransactions({
  wallets: WALLETS,
  customers: CUSTOMERS,
  agents: TOP_AGENTS,
});

export function countByStatus(status: TransactionStatus): number {
  return countTransactionsByStatus(TRANSACTIONS, status);
}
