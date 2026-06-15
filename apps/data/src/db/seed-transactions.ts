import {
  buildBackOfficeTransactions,
  type TransactionSeedAgent,
  type TransactionSeedCustomer,
  type TransactionSeedWallet,
} from './build-back-office-transactions';
import type { BackOfficeTransaction } from '../types/transaction';

export type { TransactionSeedWallet, TransactionSeedCustomer, TransactionSeedAgent };

/** Dexie ilk seed — management hydrate öncesi varsayılan fixture */
const DEFAULT_WALLETS: TransactionSeedWallet[] = [
  { id: 1, walletNo: 'MS-9901-01', ccy: 'TRY', customerId: 10001, agentId: null, cat: 'customer', recordStatus: 1 },
  { id: 2, walletNo: 'MS-9901-02', ccy: 'USD', customerId: 10001, agentId: null, cat: 'customer', recordStatus: 1 },
  { id: 3, walletNo: 'MS-9902-01', ccy: 'TRY', customerId: 10002, agentId: null, cat: 'customer', recordStatus: 1 },
  { id: 4, walletNo: 'MS-9903-01', ccy: 'EUR', customerId: 10003, agentId: null, cat: 'customer', recordStatus: 1 },
  { id: 5, walletNo: 'MS-9904-01', ccy: 'TRY', customerId: 10004, agentId: null, cat: 'customer', recordStatus: 1 },
  { id: 6, walletNo: 'MS-9905-01', ccy: 'GBP', customerId: 10005, agentId: null, cat: 'customer', recordStatus: 1 },
  { id: 7, walletNo: 'AG-0501-01', ccy: 'TRY', customerId: null, agentId: 501, cat: 'agent', recordStatus: 1 },
  { id: 8, walletNo: 'AG-0502-01', ccy: 'TRY', customerId: null, agentId: 502, cat: 'agent', recordStatus: 1 },
  { id: 9, walletNo: 'MS-9902-02', ccy: 'EUR', customerId: 10002, agentId: null, cat: 'customer', recordStatus: 1 },
  { id: 10, walletNo: 'MS-9903-02', ccy: 'USD', customerId: 10003, agentId: null, cat: 'customer', recordStatus: 1 },
];

const DEFAULT_CUSTOMERS: TransactionSeedCustomer[] = [
  { id: 10001, status: 'active', type: 'individual' },
  { id: 10002, status: 'active', type: 'individual' },
  { id: 10003, status: 'active', type: 'corporate' },
  { id: 10004, status: 'active', type: 'individual' },
  { id: 10005, status: 'active', type: 'individual' },
];

const DEFAULT_AGENTS: TransactionSeedAgent[] = [{ id: 501 }, { id: 502 }];

/** Dexie seed — deterministik ~100 kayıt */
export const BACK_OFFICE_TRANSACTION_SEED: BackOfficeTransaction[] = buildBackOfficeTransactions({
  wallets: DEFAULT_WALLETS,
  customers: DEFAULT_CUSTOMERS,
  agents: DEFAULT_AGENTS,
});

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
