import type { BackOfficeTransaction } from './transaction';

export type BackOfficeTransactionNote = {
  id: number;
  transactionId: number;
  action: string;
  text: string;
  createdBy: string;
  createdAt: string;
};

export type BackOfficeTransactionDocument = {
  id: number;
  transactionId: number;
  docType: 'Identity' | 'ProofOfTransaction';
  fileName: string;
  uploadedAt: string;
};

export type BackOfficeTransactionBlock = {
  id: number;
  transactionId: number;
  blockedAmount: number;
  active: boolean;
  reason: string;
  createdAt: string;
  releasedAt: string | null;
};

export type BackOfficeTransactionDetailSeed = {
  notes: BackOfficeTransactionNote[];
  documents: BackOfficeTransactionDocument[];
  blocks: BackOfficeTransactionBlock[];
};

export type BuildBackOfficeTransactionDetailsInput = {
  transactions: readonly Pick<
    BackOfficeTransaction,
    'id' | 'recordStatus' | 'status' | 'createdAt' | 'type' | 'amount' | 'feeFixed' | 'feeVariable' | 'txNo'
  >[];
};
