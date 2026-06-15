import { simulateNetworkLatency } from './latency';
import { getDb } from '../../db/dexie';
import { ensureBackOfficeTransactionsSeeded } from '../../db/seed-transactions';
import type { TransactionsApi } from '../../contracts/transactions-api';
import type { BackOfficeTransaction } from '../../types/transaction';
import {
  getActiveTransactionBlock,
  listTransactionBlocks,
  listTransactionDocuments,
  listTransactionNotes,
  upsertTransactionBlock,
  upsertTransactionNote,
} from '../../services/transaction-details.service';

export function createDexieTransactionsAdapter(): TransactionsApi {
  async function ensureSeeded(): Promise<void> {
    await ensureBackOfficeTransactionsSeeded(getDb());
  }

  return {
    async list() {
      await ensureSeeded();
      await simulateNetworkLatency();
      const rows = await getDb().backOfficeTransactions.toArray();
      return rows.filter((t) => t.recordStatus === 1);
    },

    async listAll() {
      await ensureSeeded();
      await simulateNetworkLatency();
      return getDb().backOfficeTransactions.toArray();
    },

    async getById(id) {
      await ensureSeeded();
      await simulateNetworkLatency();
      const row = await getDb().backOfficeTransactions.get(id);
      return row?.recordStatus === 1 ? row : undefined;
    },

    async update(id, patch) {
      await ensureSeeded();
      await simulateNetworkLatency();
      const row = await getDb().backOfficeTransactions.get(id);
      if (!row) return undefined;
      const next: BackOfficeTransaction = { ...row, ...patch };
      await getDb().backOfficeTransactions.put(next);
      return next;
    },

    async upsert(row) {
      await ensureSeeded();
      await simulateNetworkLatency();
      await getDb().backOfficeTransactions.put(row);
      return row;
    },

    async replaceAll(rows) {
      await simulateNetworkLatency();
      const db = getDb();
      await db.backOfficeTransactions.clear();
      if (rows.length > 0) {
        await db.backOfficeTransactions.bulkPut(rows);
      }
      await db.meta.put({ key: 'backOfficeTransactionsSeeded', value: 1 });
    },

    listNotes: (transactionId) => listTransactionNotes(transactionId),
    listDocuments: (transactionId) => listTransactionDocuments(transactionId),
    listBlocks: (transactionId) => listTransactionBlocks(transactionId),
    getActiveBlock: (transactionId) => getActiveTransactionBlock(transactionId),
    upsertNote: (note) => upsertTransactionNote(note),
    upsertBlock: (block) => upsertTransactionBlock(block),
  };
}
