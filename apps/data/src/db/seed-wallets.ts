import { buildBackOfficeWallets } from './build-back-office-wallets';
import { CUSTOMERS, TOP_AGENTS } from './seed-playground-mock-data';
import type { BackOfficeWallet } from '../types/mock-wallet';

/** Dexie ilk seed — management hydrate öncesi varsayılan fixture */
export const BACK_OFFICE_WALLET_SEED: BackOfficeWallet[] = buildBackOfficeWallets({
  customers: CUSTOMERS,
  agents: TOP_AGENTS,
});

export async function ensureBackOfficeWalletsSeeded(
  db: import('../db/dexie').EPayDataDB,
): Promise<void> {
  const flag = await db.meta.get('backOfficeWalletsSeeded');
  if (flag?.value === 1) return;
  const n = await db.backOfficeWallets.count();
  if (n === 0) {
    await db.backOfficeWallets.bulkPut(BACK_OFFICE_WALLET_SEED);
  }
  await db.meta.put({ key: 'backOfficeWalletsSeeded', value: 1 });
}
