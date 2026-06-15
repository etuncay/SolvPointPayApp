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
      await seedAgentPlaygroundData();
      await loadAgentWalletsStore();
      return;
    }
    configureDataLayer({ driver: 'http', apiBaseUrl: base });
    await loadAgentWalletsStore();
    return;
  }

  await initMockDataLayer();
  await seedAgentPlaygroundData();
  await loadAgentWalletsStore();
}

async function seedAgentPlaygroundData(): Promise<void> {
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

async function loadAgentWalletsStore(): Promise<void> {
  const { refreshAgentWalletsCache } = await import('@/lib/wallets-store');
  await refreshAgentWalletsCache();
}
