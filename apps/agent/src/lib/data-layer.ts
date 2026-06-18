import {
  configureDataLayer,
  buildBackOfficeTransactionDetails,
  buildBackOfficeWalletDetails,
  hydrateBackOfficeTransactions,
  hydrateBackOfficeTransactionDetails,
  hydrateBackOfficeWallets,
  hydrateBackOfficeWalletDetails,
  initMockDataLayer,
  BACK_OFFICE_AGENT_TRANSACTION_SEED,
  BACK_OFFICE_AGENT_WALLET_SEED,
  getActiveDataDriver,
  type DataDriver,
} from '@epay/data';
import { configureAgentTransactionPorts } from '@/features/transaction-confirmation/api/agent-transactions-service';
import { configureAgentLimitPorts } from '@/features/limits/api/agent-remaining-limit.service';

/** Dexie/mock sürücü aktifken true */
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
    configureAgentTransactionPorts({ driver: 'http', apiBaseUrl: base });
    configureAgentLimitPorts({ driver: 'http', apiBaseUrl: base });
    await loadAgentWalletsStore();
    return;
  }

  await initMockDataLayer();
  configureAgentTransactionPorts({ driver: 'dexie' });
  configureAgentLimitPorts({ driver: 'dexie' });
  await seedAgentPlaygroundData();
  await loadAgentWalletsStore();
}

async function seedAgentPlaygroundData(): Promise<void> {
  await hydrateBackOfficeTransactions(BACK_OFFICE_AGENT_TRANSACTION_SEED);
  await hydrateBackOfficeTransactionDetails(
    buildBackOfficeTransactionDetails({ transactions: BACK_OFFICE_AGENT_TRANSACTION_SEED }),
  );
  await hydrateBackOfficeWallets(BACK_OFFICE_AGENT_WALLET_SEED);
  await hydrateBackOfficeWalletDetails(
    buildBackOfficeWalletDetails({
      wallets: BACK_OFFICE_AGENT_WALLET_SEED,
      transactions: BACK_OFFICE_AGENT_TRANSACTION_SEED,
    }),
  );
}

async function loadAgentWalletsStore(): Promise<void> {
  const { refreshAgentWalletsCache } = await import('@/lib/wallets-store');
  await refreshAgentWalletsCache();
}
