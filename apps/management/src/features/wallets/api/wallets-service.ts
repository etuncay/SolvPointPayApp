import type { BackOfficeRole } from '@epay/ui';
import type { Wallet } from '../domain/types';
import type {
  AddNoteInput,
  BalanceBlockInput,
  LimitHistoryEntry,
  SaveWalletDetailResult,
  WalletDetail,
  WalletLimitSet,
} from '../domain/detail-types';
import type { WalletFilters, WalletListStats } from '../domain/types';
import type {
  WalletActivity,
  WalletActivityFilters,
  WalletActivityListResult,
} from '../domain/activity-types';

export type WalletChangeLogEntry = {
  id: number;
  action: 'balance_block' | 'add_note' | 'update_limits' | 'batch_unblock';
  walletId: number;
  at: string;
  by: string;
  detail: string;
};

export type WalletAccessLogEntry = {
  id: number;
  action: 'list' | 'export' | 'view' | 'activities_export';
  count?: number;
  walletId?: number;
  at: string;
  by: string;
};

export type WalletsService = {
  list(filters: WalletFilters, role: BackOfficeRole): Wallet[];
  getStats(role: BackOfficeRole): WalletListStats;
  exportRows(filters: WalletFilters, role: BackOfficeRole): Wallet[];
  getById(id: number, role: BackOfficeRole): Wallet | null;
  getDetail(id: number, role: BackOfficeRole): WalletDetail | null;
  updateLimits(id: number, limits: WalletLimitSet, role: BackOfficeRole): SaveWalletDetailResult;
  applyBalanceBlock(id: number, input: BalanceBlockInput, role: BackOfficeRole): SaveWalletDetailResult;
  addNote(id: number, input: AddNoteInput, role: BackOfficeRole): SaveWalletDetailResult;
  getLimitHistory(id: number): LimitHistoryEntry[];
  runBatchUnblock(): number;
  listActivities(
    walletId: number,
    filters: WalletActivityFilters,
    role: BackOfficeRole,
  ): WalletActivityListResult;
  exportActivities(
    walletId: number,
    filters: WalletActivityFilters,
    role: BackOfficeRole,
  ): WalletActivity[] | { error: 'wa_wallet_forbidden' | 'wa_not_found' };
};
