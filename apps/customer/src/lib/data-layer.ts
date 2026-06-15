import { configureDataLayer, initMockDataLayer, type DataDriver } from '@epay/data';

/** Mock tamamlanana kadar dexie; production'da VITE_DATA_DRIVER=http */
export async function bootstrapDataLayer(): Promise<void> {
  const driver = (import.meta.env.VITE_DATA_DRIVER as DataDriver | undefined) ?? 'dexie';

  if (driver === 'http') {
    const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
    if (!base?.trim()) {
      console.warn('[customer data-layer] http driver yok; dexie kullanılıyor');
      await initMockDataLayer();
      return;
    }
    configureDataLayer({ driver: 'http', apiBaseUrl: base });
    return;
  }

  // customerPortalApi + Dexie seed (ensureCustomerPortalSeeded)
  await initMockDataLayer();
}
