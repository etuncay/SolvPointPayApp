import type { TransactionStatus, TransactionType } from '@/features/wallets/domain/activity-types';

export type { TransactionStatus, TransactionType };

/** Spec §5 — liste projection */
export type TransactionListItem = {
  id: number;
  transactionNo: string;
  createdAt: string;
  senderCustomerNo: number | null;
  senderWalletNo: string | null;
  senderName: string;
  receiverCustomerNo: number | null;
  receiverWalletNo: string | null;
  receiverName: string;
  senderAgentNo: number | string | null;
  receiverAgentNo: number | string | null;
  iban: string | null;
  transactionType: TransactionType;
  sourceCurrency: string;
  principalAmount: number;
  status: TransactionStatus;
};

export type TransactionFilters = {
  query: string;
  status: string;
  transactionType: string;
  sourceCurrency: string;
  from: string;
  to: string;
  senderAgentNo: string;
  receiverAgentNo: string;
};

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = {
  query: '',
  status: 'all',
  transactionType: 'all',
  sourceCurrency: 'all',
  from: '',
  to: '',
  senderAgentNo: '',
  receiverAgentNo: '',
};

export type TransactionPermissions = {
  list: boolean;
  view: boolean;
  export: boolean;
};

export type TransactionAccessLogEntry = {
  id: number;
  action: 'list' | 'export' | 'view';
  count?: number;
  transactionId?: number;
  at: string;
  by: string;
};
