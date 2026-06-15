import type { WalletsApi } from '../contracts/wallets-api';
import type { BackOfficeWallet } from '../types/mock-wallet';
import { createDexieWalletsAdapter } from '../adapters/dexie/wallets-dexie.adapter';

let port: WalletsApi | null = null;

export function setWalletsApiPort(next: WalletsApi): void {
  port = next;
}

export function getWalletsApiPort(): WalletsApi | null {
  return port;
}

function resolvePort(): WalletsApi {
  if (!port) {
    port = createDexieWalletsAdapter();
  }
  return port;
}

export const walletsApi: WalletsApi = {
  list: () => resolvePort().list(),
  listAll: () => resolvePort().listAll(),
  getById: (id) => resolvePort().getById(id),
  upsert: (row) => resolvePort().upsert(row),
  replaceAll: (rows) => resolvePort().replaceAll(rows),
  listNotes: (walletId) => resolvePort().listNotes(walletId),
  listLimits: (walletId) => resolvePort().listLimits(walletId),
  listLimitHistory: (walletId) => resolvePort().listLimitHistory(walletId),
  listMovements: (walletId) => resolvePort().listMovements(walletId),
  upsertNote: (note) => resolvePort().upsertNote(note),
  upsertLimit: (limit) => resolvePort().upsertLimit(limit),
  appendLimitHistory: (entry) => resolvePort().appendLimitHistory(entry),
};

/** Management/agent zengin mock seed'ini Dexie'ye yazar */
export async function hydrateBackOfficeWallets(rows: BackOfficeWallet[]): Promise<void> {
  await resolvePort().replaceAll(rows);
}

export { hydrateBackOfficeWalletDetails } from './wallet-details.service';
