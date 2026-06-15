import { buildBackOfficeWalletDetails } from '@epay/data';
import { TRANSACTIONS } from './transactions';
import { WALLETS } from './wallets';
import type { WalletLimit } from '@/features/wallets/domain/detail-types';

const seed = buildBackOfficeWalletDetails({ wallets: WALLETS, transactions: TRANSACTIONS });

export const WALLET_LIMITS: WalletLimit[] = seed.limits;
