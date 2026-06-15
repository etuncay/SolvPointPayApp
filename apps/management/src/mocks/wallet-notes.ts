import { buildBackOfficeWalletDetails } from '@epay/data';
import { TRANSACTIONS } from './transactions';
import { WALLETS } from './wallets';

const seed = buildBackOfficeWalletDetails({ wallets: WALLETS, transactions: TRANSACTIONS });

export const WALLET_NOTES = seed.notes;
