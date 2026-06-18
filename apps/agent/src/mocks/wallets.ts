import {
  BACK_OFFICE_AGENT_WALLET_SEED,
  buildBackOfficeWallets,
  calcWalletAvailable,
  type BackOfficeWallet,
  type BackOfficeWalletCategory,
  type WalletKind,
} from '@epay/data';

export type Wallet = BackOfficeWallet;
export type WalletCategory = BackOfficeWalletCategory;
export type { WalletKind };

/** Geriye uyumluluk — agent withdrawal domain */
export { calcWalletAvailable as calcAvailable, buildBackOfficeWallets };

/** Tek kaynak @epay/data — transactional cüzdanlar dahil */
export const WALLETS: Wallet[] = BACK_OFFICE_AGENT_WALLET_SEED;
