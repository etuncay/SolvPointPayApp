import { getWallets } from '@/lib/wallets-store';

function resolveDemoWalletId(): number {
  return getWallets().find((w) => w.cat === 'customer' && w.recordStatus === 1)?.id ?? 11;
}

/** Menü 4.1 / 4.2 deep-link — bootstrap sonrası ilk erişilebilir müşteri cüzdanı */
export function getWalletMenuDemoId(): number {
  return resolveDemoWalletId();
}

export function getWalletMenuDetailHref(): string {
  return `/wallets/${resolveDemoWalletId()}`;
}

export function getWalletMenuActivitiesHref(): string {
  return `/wallets/${resolveDemoWalletId()}/activities`;
}

/** Geriye uyumluluk */
export const WALLET_MENU_DEMO_ID = resolveDemoWalletId();
export const WALLET_MENU_DETAIL_HREF = getWalletMenuDetailHref();
export const WALLET_MENU_ACTIVITIES_HREF = getWalletMenuActivitiesHref();
