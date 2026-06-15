import { CUSTOMERS, TOP_AGENTS } from './data';
import {
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
export { calcWalletAvailable as calcAvailable };

export const WALLETS: Wallet[] = buildBackOfficeWallets({
  customers: CUSTOMERS,
  agents: TOP_AGENTS,
  includeTransactionalWallets: true,
});
