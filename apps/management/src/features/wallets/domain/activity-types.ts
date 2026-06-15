import type { LedgerDirection, TransactionStatus, TransactionType } from '@epay/domain';
import type { FeeTransactionType } from '@epay/domain';

export type { TransactionStatus, TransactionType, FeeTransactionType };
export type TransactionDirection = LedgerDirection;

/** Liste grid satırı — movement + transaction join */
export type WalletActivity = {
  id: number;
  transactionId: number;
  transactionNo: string;
  referenceNo: string;
  createdAt: string;
  direction: TransactionDirection;
  counterpartyNo: number | string | null;
  counterpartyName: string;
  counterpartyAccount: string;
  senderAgentNo: number | null;
  receiverAgentNo: number | null;
  transactionType: TransactionType;
  currency: string;
  amount: number;
  postBalance: number;
  status: TransactionStatus;
};

export type WalletActivityFilters = {
  query: string;
  direction: string;
  status: string;
  transactionType: string;
  currency: string;
  from: string;
  to: string;
};

export const DEFAULT_WALLET_ACTIVITY_FILTERS: WalletActivityFilters = {
  query: '',
  direction: 'all',
  status: 'all',
  transactionType: 'all',
  currency: 'all',
  from: '',
  to: '',
};

export type WalletActivityPermissions = {
  list: boolean;
  view: boolean;
  export: boolean;
};

export type WalletActivityListResult =
  | { ok: true; rows: WalletActivity[] }
  | { ok: false; error: 'wa_wallet_forbidden' | 'wa_not_found' };
