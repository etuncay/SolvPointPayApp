import type { BackOfficeWallet } from '../types/mock-wallet';
import type { BackOfficeTransaction } from '../types/transaction';
import { CUSTOMERS, TOP_AGENTS } from './seed-playground-mock-data';
import {
  buildBackOfficeTransactions,
  type TransactionSeedCustomer,
  type TransactionSeedWallet,
} from './build-back-office-transactions';

export function toTransactionSeedWallets(
  wallets: readonly BackOfficeWallet[],
): TransactionSeedWallet[] {
  return wallets
    .filter((w) => w.recordStatus === 1 && w.cat !== 'system')
    .map((w) => ({
      id: w.id,
      walletNo: w.walletNo,
      ccy: w.ccy,
      customerId: w.customerId,
      agentId: w.agentId,
      cat: w.cat,
      recordStatus: w.recordStatus,
    }));
}

export function toTransactionSeedCustomers(): TransactionSeedCustomer[] {
  return CUSTOMERS.filter((c) => c.type !== 'prospective').map((c) => ({
    id: c.id,
    status: c.status,
    type: c.type,
  }));
}

/** Cüzdan fixture'ından deterministik işlem seed'i — management/agent aynı builder */
export function buildBackOfficeTransactionSeed(
  wallets: readonly BackOfficeWallet[],
): BackOfficeTransaction[] {
  return buildBackOfficeTransactions({
    wallets: toTransactionSeedWallets(wallets),
    customers: toTransactionSeedCustomers(),
    agents: TOP_AGENTS.map((a) => ({ id: a.id })),
  });
}
