import { WALLETS as FALLBACK_WALLETS } from '@/mocks/wallets';
import type { Wallet } from '@/features/wallets/domain/types';

let cache: Wallet[] | null = null;
let loadPromise: Promise<void> | null = null;

/** Bootstrap sonrası mock adapter + walletsApi ile senkron cüzdan listesi */
export async function ensureManagementWalletsReady(): Promise<void> {
  if (cache) return;
  if (loadPromise) {
    await loadPromise;
    return;
  }
  loadPromise = (async () => {
    const { ensureWalletsStoreReady, getWalletRows } = await import(
      '@/features/wallets/api/mock-wallets-adapter'
    );
    await ensureWalletsStoreReady();
    cache = [...getWalletRows()];
  })();
  await loadPromise;
}

/** Adapter store güncellenince getWallets() ile uyumlu tut */
export function syncManagementWalletsCache(rows: readonly Wallet[]): void {
  cache = rows.map((w) => ({ ...w }));
}

export async function refreshManagementWalletsCache(): Promise<void> {
  cache = null;
  loadPromise = null;
  await ensureManagementWalletsReady();
}

export function getWallets(): readonly Wallet[] {
  return cache ?? FALLBACK_WALLETS;
}

export function __resetManagementWalletsCacheForTest(): void {
  cache = null;
  loadPromise = null;
}
