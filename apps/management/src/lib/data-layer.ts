import {
  configureDataLayer,
  buildBackOfficeTransactionDetails,
  buildBackOfficeWalletDetails,
  hydrateBackOfficeTransactions,
  hydrateBackOfficeTransactionDetails,
  hydrateBackOfficeWallets,
  hydrateBackOfficeWalletDetails,
  initMockDataLayer,
  getActiveDataDriver,
  BACK_OFFICE_TRANSACTION_SEED,
  BACK_OFFICE_WALLET_SEED,
  type DataDriver,
} from '@epay/data';

/** Dexie/mock sürücü aktifken true — gerçek HTTP API kullanılmıyor. */
export function isDemoMode(): boolean {
  return getActiveDataDriver() !== 'http';
}

/**
 * Mock tamamlanana kadar dexie; production'da VITE_DATA_DRIVER=http ile gerçek API.
 */
export async function bootstrapDataLayer(): Promise<void> {
  const driver = (import.meta.env.VITE_DATA_DRIVER as DataDriver | undefined) ?? 'dexie';

  if (driver === 'http') {
    const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
    if (!base?.trim()) {
      throw new Error('[data-layer] VITE_DATA_DRIVER=http iken VITE_API_BASE_URL zorunlu');
    }
    configureDataLayer({ driver: 'http', apiBaseUrl: base });
    await loadTransfersStore();
    await loadWalletsStore();
    return;
  }

  await initMockDataLayer();
  await seedManagementTransactions();
  await loadTransfersStore();
  await loadWalletsStore();
}

async function seedManagementTransactions(): Promise<void> {
  await hydrateBackOfficeTransactions(BACK_OFFICE_TRANSACTION_SEED);
  await hydrateBackOfficeTransactionDetails(
    buildBackOfficeTransactionDetails({ transactions: BACK_OFFICE_TRANSACTION_SEED }),
  );
  await hydrateBackOfficeWallets(BACK_OFFICE_WALLET_SEED);
  await hydrateBackOfficeWalletDetails(
    buildBackOfficeWalletDetails({
      wallets: BACK_OFFICE_WALLET_SEED,
      transactions: BACK_OFFICE_TRANSACTION_SEED,
    }),
  );
}

async function loadTransfersStore(): Promise<void> {
  const { ensureTransactionsStoreReady } = await import(
    '@/features/transfers/api/mock-transactions-adapter'
  );
  await ensureTransactionsStoreReady();
}

async function loadWalletsStore(): Promise<void> {
  const { ensureManagementWalletsReady } = await import('@/lib/wallets-store');
  await ensureManagementWalletsReady();
}
