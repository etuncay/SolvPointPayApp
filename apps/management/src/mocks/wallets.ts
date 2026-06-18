import {
  BACK_OFFICE_WALLET_SEED,
  buildBackOfficeWallets,
  type BackOfficeWallet,
  type BackOfficeWalletCategory,
} from '@epay/data';

export type Wallet = BackOfficeWallet;
export type WalletCategory = BackOfficeWalletCategory;

export { buildBackOfficeWallets };

/** Tek kaynak @epay/data — Dexie seed ile aynı fixture */
export const WALLETS: Wallet[] = BACK_OFFICE_WALLET_SEED;
