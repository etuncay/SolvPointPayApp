import type { TransactionStatus, TransactionType } from '@/features/wallets/domain/activity-types';

export type TransactionParty = {
  customerNo: number | null;
  walletNo: string | null;
  walletId: number | null;
  name: string;
  phone: string | null;
  idNo: string | null;
  idKind: string | null;
  city: string | null;
  iban: string | null;
  isCorporate: boolean;
};

export type TransactionAuthorizedPerson = {
  name: string;
  title: string;
  phone: string;
};

export type TransactionAgentInfo = {
  id: number | string;
  name: string;
};

export type TransactionDocument = {
  id: number;
  transactionId: number;
  docType: 'Identity' | 'ProofOfTransaction';
  fileName: string;
  uploadedAt: string;
};

export type TransactionNote = {
  id: number;
  transactionId: number;
  action: string;
  text: string;
  createdBy: string;
  createdAt: string;
  formatted: string;
};

export type TransactionBlock = {
  id: number;
  transactionId: number;
  blockedAmount: number;
  active: boolean;
  reason: string;
  createdAt: string;
  releasedAt: string | null;
};

export type TransactionDetail = {
  id: number;
  transactionNo: string;
  referenceNo: string;
  foreignReferenceNo: string | null;
  status: TransactionStatus;
  createdAt: string;
  withdrawalDate: string | null;
  transactionType: TransactionType;
  paymentPurpose: string | null;
  description: string | null;
  sender: TransactionParty;
  receiver: TransactionParty;
  senderAuthorized: TransactionAuthorizedPerson | null;
  receiverAuthorized: TransactionAuthorizedPerson | null;
  senderAgent: TransactionAgentInfo | null;
  receiverAgent: TransactionAgentInfo | null;
  sourceCurrency: string;
  targetCurrency: string;
  principalAmount: number;
  targetAmount: number | null;
  fxRate: number | null;
  feeFixed: number;
  feeVariable: number;
  notes: TransactionNote[];
  notesDisplay: string;
  documents: TransactionDocument[];
  activeBlock: TransactionBlock | null;
  isTerminal: boolean;
};

export type TransactionDetailPermissions = {
  view: boolean;
  hold: boolean;
  unblock: boolean;
  cancel: boolean;
  submitApproval: boolean;
  approveManual: boolean;
};

export type InterventionResult = {
  ok: boolean;
  error?: string;
};

export type TransactionChangeLogEntry = {
  id: number;
  transactionId: number;
  action: 'hold' | 'unblock' | 'cancel' | 'submit_approval';
  fromStatus: TransactionStatus;
  toStatus: TransactionStatus;
  reason: string;
  at: string;
  by: string;
};
