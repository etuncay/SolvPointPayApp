import type { TransactionsApi } from '../contracts/transactions-api';
import type { BackOfficeTransaction } from '../types/transaction';
import { createDexieTransactionsAdapter } from '../adapters/dexie/transactions-dexie.adapter';

let port: TransactionsApi | null = null;

export function setTransactionsApiPort(next: TransactionsApi): void {
  port = next;
}

export function getTransactionsApiPort(): TransactionsApi | null {
  return port;
}

function resolvePort(): TransactionsApi {
  if (!port) {
    port = createDexieTransactionsAdapter();
  }
  return port;
}

export const transactionsApi: TransactionsApi = {
  list: () => resolvePort().list(),
  listAll: () => resolvePort().listAll(),
  getById: (id) => resolvePort().getById(id),
  update: (id, patch) => resolvePort().update(id, patch),
  upsert: (row) => resolvePort().upsert(row),
  replaceAll: (rows) => resolvePort().replaceAll(rows),
  listNotes: (transactionId) => resolvePort().listNotes(transactionId),
  listDocuments: (transactionId) => resolvePort().listDocuments(transactionId),
  listBlocks: (transactionId) => resolvePort().listBlocks(transactionId),
  getActiveBlock: (transactionId) => resolvePort().getActiveBlock(transactionId),
  upsertNote: (note) => resolvePort().upsertNote(note),
  upsertBlock: (block) => resolvePort().upsertBlock(block),
};

/** Management zengin mock seed'ini Dexie'ye yazar — cüzdan ID uyumu korunur */
export async function hydrateBackOfficeTransactions(
  rows: BackOfficeTransaction[],
): Promise<void> {
  await resolvePort().replaceAll(rows);
}

export { hydrateBackOfficeTransactionDetails } from './transaction-details.service';
