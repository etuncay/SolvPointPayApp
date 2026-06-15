/** Agent işlem mock'ları — ortak durum/tür @epay/domain */
import type { TransactionStatus, TransactionType } from '@epay/domain';
import { isTerminalTransactionStatus } from '@epay/domain';

export type { TransactionStatus, TransactionType };

export function isTerminalStatus(status: TransactionStatus): boolean {
  return isTerminalTransactionStatus(status);
}
