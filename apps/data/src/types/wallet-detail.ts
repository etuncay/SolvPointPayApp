import type { LedgerDirection } from '@epay/domain';
import type { WalletLimitGroup, WalletLimitType } from '@epay/domain';
import type { BackOfficeWallet } from './mock-wallet';
import type { BackOfficeTransaction } from './transaction';

export type BackOfficeWalletNote = {
  id: number;
  walletId: number;
  action: string;
  text: string;
  createdBy: string;
  createdAt: string;
};

export type BackOfficeWalletLimit = {
  id: number;
  walletId: number;
  limitGroup: WalletLimitGroup;
  limitType: WalletLimitType;
  amount: number;
  startDate: string;
  endDate: string | null;
  changedBy: string;
  approvedBy: string | null;
};

export type BackOfficeWalletLimitHistory = {
  id: number;
  walletId: number;
  limitGroup: WalletLimitGroup;
  limitType: WalletLimitType;
  amount: number;
  startDate: string;
  endDate: string | null;
  changedBy: string;
  approvedBy: string | null;
};

export type BackOfficeWalletMovement = {
  id: number;
  walletId: number;
  transactionId: number;
  direction: LedgerDirection;
  amount: number;
  postBalance: number;
  createdAt: string;
  recordStatus: 0 | 1;
};

export type BackOfficeWalletDetailSeed = {
  notes: BackOfficeWalletNote[];
  limits: BackOfficeWalletLimit[];
  limitHistory: BackOfficeWalletLimitHistory[];
  movements: BackOfficeWalletMovement[];
};

export type BuildBackOfficeWalletDetailsInput = {
  wallets: readonly BackOfficeWallet[];
  transactions: readonly Pick<
    BackOfficeTransaction,
    | 'id'
    | 'recordStatus'
    | 'senderWalletId'
    | 'receiverWalletId'
    | 'amount'
    | 'createdAt'
  >[];
  rngSeed?: number;
};

export type { WalletLimitGroup, WalletLimitType };
