import { CUSTOMERS, TOP_AGENTS } from './data';
import {
  buildBackOfficeWallets,
  type BackOfficeWallet,
  type BackOfficeWalletCategory,
} from '@epay/data';

export type Wallet = BackOfficeWallet;
export type WalletCategory = BackOfficeWalletCategory;

export const WALLETS: Wallet[] = buildBackOfficeWallets({
  customers: CUSTOMERS,
  agents: TOP_AGENTS,
});
