import type { Wallet } from './types';

import {
  WALLET_LIMIT_GROUPS as LIMIT_GROUPS,
  WALLET_LIMIT_TYPES as LIMIT_TYPES,
  type WalletLimitGroup as LimitGroup,
  type WalletLimitType as LimitType,
} from '@epay/domain';

export { LIMIT_GROUPS, LIMIT_TYPES };
export type { LimitGroup, LimitType };

/** Aktif limit satırı */
export type WalletLimit = {
  id: number;
  walletId: number;
  limitGroup: LimitGroup;
  limitType: LimitType;
  amount: number;
  startDate: string;
  endDate: string | null;
  changedBy: string;
  approvedBy: string | null;
};

export type WalletLimitValues = Record<LimitType, number>;
export type WalletLimitSet = Record<LimitGroup, WalletLimitValues>;

export type WalletNote = {
  id: number;
  walletId: number;
  formatted: string;
  createdBy: string;
  createdAt: string;
  action: string;
  text: string;
};

export type LimitHistoryEntry = {
  id: number;
  walletId: number;
  limitGroup: LimitGroup;
  limitType: LimitType;
  amount: number;
  startDate: string;
  endDate: string | null;
  changedBy: string;
  approvedBy: string | null;
};

export type WalletDetail = Wallet & {
  blockEndDate: string | null;
  lastTxAt: string | null;
  lastTxAmount: number | null;
  notes: WalletNote[];
  notesDisplay: string;
  limits: WalletLimitSet;
  isSystemWallet: boolean;
};

export type WalletDetailPermissions = {
  view: boolean;
  balanceBlock: boolean;
  addNote: boolean;
  editLimits: boolean;
};

export type BalanceBlockInput = {
  blockedAmount: number;
  blockEndDate: string | null;
  reason: string;
};

export type AddNoteInput = {
  text: string;
};

export type SaveWalletDetailResult = {
  ok: boolean;
  error?: string;
};

export const EMPTY_LIMIT_VALUES: WalletLimitValues = {
  Single: 0,
  DailyCount: 0,
  DailyAmount: 0,
  MonthlyCount: 0,
  MonthlyAmount: 0,
};

export function emptyLimitSet(): WalletLimitSet {
  return {
    Withdrawal: { ...EMPTY_LIMIT_VALUES },
    Transfer: { ...EMPTY_LIMIT_VALUES },
    International: { ...EMPTY_LIMIT_VALUES },
  };
}
