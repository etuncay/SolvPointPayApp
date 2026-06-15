import type { TransactionStatus, TransactionType } from '@epay/domain';

/** Backoffice / agent paylaşımlı işlem kaydı (transaction tablosu) */
export interface BackOfficeTransaction {
  id: number;
  txNo: string;
  referenceNo: string;
  senderCustomerId: number | null;
  senderAgentId: number | string | null;
  receiverCustomerId: number | null;
  receiverAgentId: number | string | null;
  senderWalletId: number | null;
  receiverWalletId: number | null;
  senderIban: string | null;
  receiverIban: string | null;
  type: TransactionType;
  currency: string;
  targetCurrency?: string;
  amount: number;
  status: TransactionStatus;
  recordStatus: 0 | 1;
  createdAt: string;
  foreignReferenceNo?: string | null;
  feeFixed?: number;
  feeVariable?: number;
  fxRate?: number | null;
  targetAmount?: number | null;
  paymentPurpose?: string | null;
  description?: string | null;
  withdrawalDate?: string | null;
}

export type { TransactionStatus, TransactionType };
