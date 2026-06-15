import { simulateNetworkLatency } from './latency';
import { getDb } from '../../db/dexie';
import { ensureBackOfficeWalletsSeeded } from '../../db/seed-wallets';
import type { WalletsApi } from '../../contracts/wallets-api';
import type { BackOfficeWallet } from '../../types/mock-wallet';
import {
  appendWalletLimitHistory,
  listWalletLimitHistory,
  listWalletLimits,
  listWalletMovements,
  listWalletNotes,
  upsertWalletLimit,
  upsertWalletNote,
} from '../../services/wallet-details.service';

export function createDexieWalletsAdapter(): WalletsApi {
  async function ensureSeeded(): Promise<void> {
    await ensureBackOfficeWalletsSeeded(getDb());
  }

  return {
    async list() {
      await ensureSeeded();
      await simulateNetworkLatency();
      const rows = await getDb().backOfficeWallets.toArray();
      return rows.filter((w) => w.recordStatus === 1);
    },

    async listAll() {
      await ensureSeeded();
      await simulateNetworkLatency();
      return getDb().backOfficeWallets.toArray();
    },

    async getById(id) {
      await ensureSeeded();
      await simulateNetworkLatency();
      const row = await getDb().backOfficeWallets.get(id);
      return row?.recordStatus === 1 ? row : undefined;
    },

    async upsert(row) {
      await ensureSeeded();
      await simulateNetworkLatency();
      await getDb().backOfficeWallets.put(row);
      return row;
    },

    async replaceAll(rows) {
      await simulateNetworkLatency();
      const db = getDb();
      await db.backOfficeWallets.clear();
      if (rows.length > 0) {
        await db.backOfficeWallets.bulkPut(rows);
      }
      await db.meta.put({ key: 'backOfficeWalletsSeeded', value: 1 });
    },

    listNotes: (walletId) => listWalletNotes(walletId),
    listLimits: (walletId) => listWalletLimits(walletId),
    listLimitHistory: (walletId) => listWalletLimitHistory(walletId),
    listMovements: (walletId) => listWalletMovements(walletId),
    upsertNote: (note) => upsertWalletNote(note),
    upsertLimit: (limit) => upsertWalletLimit(limit),
    appendLimitHistory: (entry) => appendWalletLimitHistory(entry),
  };
}
