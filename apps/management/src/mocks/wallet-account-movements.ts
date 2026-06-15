import { buildBackOfficeWalletDetails } from '@epay/data';
import { TRANSACTIONS } from './transactions';
import { WALLETS } from './wallets';

const seed = buildBackOfficeWalletDetails({ wallets: WALLETS, transactions: TRANSACTIONS });

export type WalletAccountMovement = (typeof seed.movements)[number];
export const WALLET_ACCOUNT_MOVEMENTS = seed.movements;

export function movementsForWallet(walletId: number): WalletAccountMovement[] {
  return WALLET_ACCOUNT_MOVEMENTS.filter((m) => m.walletId === walletId && m.recordStatus === 1);
}
