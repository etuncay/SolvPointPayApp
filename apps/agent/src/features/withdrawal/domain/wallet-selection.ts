import type { RecipientWallet } from './types';

/**
 * §8 cüzdan seçimi:
 * - Tek cüzdan → o cüzdan (para birimi kilitli)
 * - Çoklu → önce CustomerTransactional, yoksa CustomerPersistent
 * - currency verilirse önce o para birimindeki cüzdanlar değerlendirilir
 */
export function resolveWithdrawalWallet(
  wallets: RecipientWallet[],
  currency?: string,
): RecipientWallet | null {
  if (wallets.length === 0) return null;
  if (wallets.length === 1) return wallets[0]!;

  const byCurrency = currency ? wallets.filter((w) => w.currency === currency) : [];
  const pool = byCurrency.length > 0 ? byCurrency : wallets;

  return (
    pool.find((w) => w.walletKind === 'CustomerTransactional') ??
    pool.find((w) => w.walletKind === 'CustomerPersistent') ??
    pool[0]!
  );
}

/** Transactional cüzdanda tutar tüm bakiyeye kilitlenir (readonly). */
export function isTransactional(wallet: RecipientWallet | null): boolean {
  return wallet?.walletKind === 'CustomerTransactional';
}

/** Benzersiz para birimi seçenekleri (combobox). */
export function currencyOptions(wallets: RecipientWallet[]): string[] {
  return [...new Set(wallets.map((w) => w.currency))];
}
