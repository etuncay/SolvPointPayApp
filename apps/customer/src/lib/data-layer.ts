import { configureDataLayer, getActiveDataDriver, initMockDataLayer, type DataDriver } from '@epay/data';

/** Dexie/mock sürücü aktifken true — login demo notları ve varsayılan parola. */
export function isDemoMode(): boolean {
  return getActiveDataDriver() !== 'http';
}

/** Demo login alanlarını doldur — yalnızca dev + mock; production build'de parola boş kalır. */
export function shouldPrefillLoginDemo(): boolean {
  return isDemoMode() && !import.meta.env.PROD;
}

export type SettingsEnvironmentKind = 'demo' | 'staging';

/** Ayarlar sayfası ortam etiketi — production + http'de gizlenir. */
export function getSettingsEnvironmentKind(): SettingsEnvironmentKind | null {
  if (isDemoMode()) return 'demo';
  if (!import.meta.env.PROD) return 'staging';
  return null;
}

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
