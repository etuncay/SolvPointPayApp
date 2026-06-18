import type { BackOfficeTransaction } from '../types/transaction';
import { buildBackOfficeTransactionSeed } from './back-office-seed-utils';
import { BACK_OFFICE_AGENT_WALLET_SEED, BACK_OFFICE_WALLET_SEED } from './seed-wallets';

/** Dexie + management mock — BACK_OFFICE_WALLET_SEED ile senkron */
export const BACK_OFFICE_TRANSACTION_SEED: BackOfficeTransaction[] =
  buildBackOfficeTransactionSeed(BACK_OFFICE_WALLET_SEED);

/** Agent mock — transactional cüzdanlar dahil */
export const BACK_OFFICE_AGENT_TRANSACTION_SEED: BackOfficeTransaction[] =
  buildBackOfficeTransactionSeed(BACK_OFFICE_AGENT_WALLET_SEED);

export async function ensureBackOfficeTransactionsSeeded(
  db: import('../db/dexie').EPayDataDB,
): Promise<void> {
  const flag = await db.meta.get('backOfficeTransactionsSeeded');
  if (flag?.value === 1) return;
  const n = await db.backOfficeTransactions.count();
  if (n === 0) {
    await db.backOfficeTransactions.bulkPut(BACK_OFFICE_TRANSACTION_SEED);
  }
  await db.meta.put({ key: 'backOfficeTransactionsSeeded', value: 1 });
}
