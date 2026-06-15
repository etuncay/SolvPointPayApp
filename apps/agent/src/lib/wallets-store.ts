import { walletsApi, type BackOfficeWallet } from '@epay/data';
import { WALLETS as FALLBACK_WALLETS } from '@/mocks/wallets';

let cache: BackOfficeWallet[] | null = null;
let loadPromise: Promise<void> | null = null;

async function loadFromApi(): Promise<BackOfficeWallet[]> {
  const rows = await walletsApi.listAll();
  return (rows.length > 0 ? rows : FALLBACK_WALLETS).map((w) => ({ ...w }));
}

/** Bootstrap sonrası @epay/data walletsApi ile senkronize cüzdan listesi */
export async function ensureAgentWalletsReady(): Promise<void> {
  if (cache) return;
  if (loadPromise) {
    await loadPromise;
    return;
  }
  loadPromise = (async () => {
    try {
      cache = await loadFromApi();
    } catch {
      cache = FALLBACK_WALLETS.map((w) => ({ ...w }));
    }
  })();
  await loadPromise;
}

/** Dexie/API güncellemesi sonrası yeniden yükle */
export async function refreshAgentWalletsCache(): Promise<void> {
  cache = null;
  loadPromise = null;
  await ensureAgentWalletsReady();
}

export function syncAgentWalletsCache(rows: readonly BackOfficeWallet[]): void {
  cache = rows.map((w) => ({ ...w }));
}

export function getWallets(): readonly BackOfficeWallet[] {
  return cache ?? FALLBACK_WALLETS;
}

/** Test reset — modül cache sıfırla */
export function __resetAgentWalletsCacheForTest(): void {
  cache = null;
  loadPromise = null;
}
