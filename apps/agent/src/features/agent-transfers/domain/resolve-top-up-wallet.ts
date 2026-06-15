import type { AgentCustomerWallet } from '@/features/agent-transactions/domain/customer-lookup';
import type { TopUpWalletOption } from './own-wallet-types';

/** Müşteri No + PB → CustomerPersistent cüzdan (6.1 §7). */
export function resolveTopUpWallet(wallets: AgentCustomerWallet[], currency: string): TopUpWalletOption | null {
  const persistent = wallets.filter((w) => w.walletKind === 'CustomerPersistent' && w.currency === currency);
  if (persistent.length >= 1) {
    const w = persistent[0]!;
    return { walletId: w.walletId, walletNo: w.walletNo, currency: w.currency, available: w.available };
  }
  const fallback = wallets.find((w) => w.currency === currency);
  if (!fallback) return null;
  return {
    walletId: fallback.walletId,
    walletNo: fallback.walletNo,
    currency: fallback.currency,
    available: fallback.available,
  };
}

export function topUpCurrencyOptions(wallets: AgentCustomerWallet[]): string[] {
  const persistent = wallets.filter((w) => w.walletKind === 'CustomerPersistent');
  const source = persistent.length ? persistent : wallets;
  return [...new Set(source.map((w) => w.currency))];
}

export function getTopUpWallets(wallets: AgentCustomerWallet[]): TopUpWalletOption[] {
  const persistent = wallets.filter((w) => w.walletKind === 'CustomerPersistent');
  const source = persistent.length ? persistent : wallets;
  return source.map((w) => ({
    walletId: w.walletId,
    walletNo: w.walletNo,
    currency: w.currency,
    available: w.available,
  }));
}
