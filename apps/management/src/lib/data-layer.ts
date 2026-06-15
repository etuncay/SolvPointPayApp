import {
  configureDataLayer,
  buildBackOfficeTransactionDetails,
  buildBackOfficeWalletDetails,
  hydrateBackOfficeTransactions,
  hydrateBackOfficeTransactionDetails,
  hydrateBackOfficeWallets,
  hydrateBackOfficeWalletDetails,
  initMockDataLayer,
  type DataDriver,
} from '@epay/data';

/**
 * Mock tamamlanana kadar dexie; production'da VITE_DATA_DRIVER=http ile gerçek API.
 */
export async function bootstrapDataLayer(): Promise<void> {
  const driver = (import.meta.env.VITE_DATA_DRIVER as DataDriver | undefined) ?? 'dexie';

  if (driver === 'http') {
    const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
    if (!base?.trim()) {
      console.warn('[data-layer] VITE_DATA_DRIVER=http ama VITE_API_BASE_URL yok; dexie kullanılıyor');
      await initMockDataLayer();
      await seedManagementTransactions();
      await loadTransfersStore();
      await loadWalletsStore();
      return;
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
  const { TRANSACTIONS } = await import('@/mocks/transactions');
  const { WALLETS } = await import('@/mocks/wallets');
  await hydrateBackOfficeTransactions(TRANSACTIONS);
  await hydrateBackOfficeTransactionDetails(
    buildBackOfficeTransactionDetails({ transactions: TRANSACTIONS }),
  );
  await hydrateBackOfficeWallets(WALLETS);
  await hydrateBackOfficeWalletDetails(
    buildBackOfficeWalletDetails({ wallets: WALLETS, transactions: TRANSACTIONS }),
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
