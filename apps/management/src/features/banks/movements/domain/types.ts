import type { FeeCurrency } from '@/features/customer-fees/domain/types';

export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Returned';

export type BankTransferMethod = 'EFT' | 'FAST' | 'SWIFT' | 'Internal';

export type BankAccountMovement = {
  id: number;
  sourceBank: string;
  targetBank: string;
  sourceIban: string;
  targetIban: string;
  currency: FeeCurrency;
  amount: number;
  paymentStatus: PaymentStatus;
  bankTransferMethod: BankTransferMethod;
  createdAt: string;
  transactionDate: string;
  referenceNo: string;
  name: string;
  taxNo: string;
  bankTransactionNo: string;
  description: string | null;
  errorMessage: string | null;
  recordStatus: 0 | 1;
};

export type BankMovementIngestInput = Omit<BankAccountMovement, 'id' | 'recordStatus'>;

export type BankMovementFilters = {
  query: string;
  paymentStatus: PaymentStatus | 'all';
  bankTransferMethod: BankTransferMethod | 'all';
  currency: FeeCurrency | 'all';
  amountMin: string;
  amountMax: string;
  transactionFrom: string;
  transactionTo: string;
};

export const DEFAULT_BANK_MOVEMENT_FILTERS: BankMovementFilters = {
  query: '',
  paymentStatus: 'all',
  bankTransferMethod: 'all',
  currency: 'all',
  amountMin: '',
  amountMax: '',
  transactionFrom: '',
  transactionTo: '',
};

export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ['Pending', 'Completed', 'Failed', 'Returned'];

export const BANK_TRANSFER_METHOD_OPTIONS: BankTransferMethod[] = ['EFT', 'FAST', 'SWIFT', 'Internal'];

export type BankMovementPermissions = {
  list: boolean;
  view: boolean;
  export: boolean;
  insert: boolean;
  update: boolean;
};

export type BankMovementIngestResult =
  | { ok: true; id: number }
  | { ok: false; duplicate: true }
  | { ok: false; duplicate?: false; error: string };
