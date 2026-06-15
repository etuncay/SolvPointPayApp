import type { FeeCurrency } from '@/features/customer-fees/domain/types';

export type ReconciliationStatus = 'Matched' | 'Unmatched' | 'PendingReview' | 'Adjusted';

export type BankReconciliation = {
  id: number;
  bank: string;
  transactionDate: string;
  transactionType: string;
  referenceNo: string;
  amount: number;
  bankCurrency: FeeCurrency;
  bankAmount: number;
  reconciliationDate: string;
  status: ReconciliationStatus;
  caseId: number | null;
  caseNo: string | null;
  firmSourceId: string | null;
  recordStatus: 0 | 1;
};

export type BankReconciliationFilters = {
  query: string;
  bank: string;
  status: ReconciliationStatus | 'all';
  reconciliationFrom: string;
  reconciliationTo: string;
};

export const DEFAULT_BANK_RECONCILIATION_FILTERS: BankReconciliationFilters = {
  query: '',
  bank: 'all',
  status: 'all',
  reconciliationFrom: '',
  reconciliationTo: '',
};

export const RECONCILIATION_STATUS_OPTIONS: ReconciliationStatus[] = [
  'Matched',
  'Unmatched',
  'PendingReview',
  'Adjusted',
];

export type BankReconciliationPermissions = {
  list: boolean;
  view: boolean;
  run: boolean;
};

export type BankReconciliationRunResult = {
  ok: true;
  matched: number;
  unmatched: number;
  casesCreated: number;
  rowsProcessed: number;
};

export type BankReconciliationCloseResult =
  | { ok: true; alreadyAdjusted?: boolean }
  | { ok: false; error: string };
