import type { BackOfficeWallet, BackOfficeWalletCategory } from '@epay/data';

export type Wallet = BackOfficeWallet;
export type WalletCategory = BackOfficeWalletCategory;

/** Liste grid satırı — mevcut Wallet ile aynı */
export type WalletListItem = Wallet;

export type WalletFilters = {
  query: string;
  cat: string;
  ccy: string;
  type: string;
  state: string;
  from: string;
  to: string;
};

export const DEFAULT_WALLET_FILTERS: WalletFilters = {
  query: '',
  cat: 'all',
  ccy: 'all',
  type: 'any',
  state: 'any',
  from: '',
  to: '',
};

export type WalletPermissions = {
  list: boolean;
  export: boolean;
  viewDetail: boolean;
};

export type WalletAccessLogEntry = {
  id: number;
  action: 'list' | 'export' | 'view';
  count?: number;
  walletId?: number;
  at: string;
  by: string;
};

export type WalletListStats = {
  totalCount: number;
  customerCount: number;
  agentCount: number;
  systemCount: number;
  blockedFullCount: number;
  blockedPartialCount: number;
  txTodayTotal: number;
  totalsByCcy: Record<string, number>;
};
