import type { BankAccountMovement, BankMovementIngestInput } from './types';

/** Mükerrer ingest anahtarı — spec §10 */
export function movementUniqueKey(
  m: Pick<BankAccountMovement, 'bankTransactionNo' | 'sourceBank' | 'transactionDate'>,
): string {
  return `${m.bankTransactionNo}|${m.sourceBank}|${m.transactionDate}`;
}

export function ingestMatchesKey(
  payload: BankMovementIngestInput,
  key: string,
): boolean {
  return movementUniqueKey(payload) === key;
}
