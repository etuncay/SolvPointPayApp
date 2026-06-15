import { buildBackOfficeWalletDetails } from '@epay/data';
import { TRANSACTIONS } from './transactions';
import { WALLETS } from './wallets';
import type { LimitHistoryEntry } from '@/features/wallets/domain/detail-types';

const seed = buildBackOfficeWalletDetails({ wallets: WALLETS, transactions: TRANSACTIONS });

export const WALLET_LIMIT_HISTORY: LimitHistoryEntry[] = seed.limitHistory;
