import type { TransactionType } from '@/features/transaction-confirmation/domain/transaction-types';

export type TransferVariant = 'ownWallet' | 'bankAccount' | 'person' | 'abroad';

export const VARIANT_TX_TYPE: Record<TransferVariant, TransactionType> = {
  ownWallet: 'WalletTopUp',
  bankAccount: 'WalletToBankAccount',
  person: 'WalletToPerson',
  abroad: 'InternationalTransfer',
};

export interface TransferFeeTier {
  id: string;
  currency: string;
  minAmount: number;
  maxAmount: number | null;
  fixedFee: number;
  rate: number;
  campaignEndDate: string | null;
}

export interface FxQuote {
  sourceCurrency: string;
  targetCurrency: string;
  rate: number;
  sourceAmount: number;
  targetAmount: number;
  expiresAt: string;
}

export interface TransferSubmitBase {
  variant: TransferVariant;
  senderCustomerId: number;
  currency: string;
  amount: number;
  clientReference: string;
  isSuspicious: boolean;
  authorizedPersonIdNo?: string;
  screenIdNo: string;
  screenName: string;
  paymentPurpose?: string;
  description?: string;
}

export interface OwnWalletPayload extends TransferSubmitBase {
  variant: 'ownWallet';
  walletId: number;
}

export interface BankAccountPayload extends TransferSubmitBase {
  variant: 'bankAccount';
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  iban: string;
}

export interface PersonPayload extends TransferSubmitBase {
  variant: 'person';
  receiverName: string;
  receiverIdNo?: string;
  receiverPhone: string;
  receiverEmail: string;
  receiverCustomerId?: number;
}

export interface AbroadPayload extends TransferSubmitBase {
  variant: 'abroad';
  receiverName: string;
  country: string;
  receiverPhone: string;
  receiverEmail: string;
  targetCurrency: string;
  fxRate: number;
  targetAmount: number;
}

export type TransferSubmitPayload = OwnWalletPayload | BankAccountPayload | PersonPayload | AbroadPayload;

export type TransferSubmitResult =
  | { ok: true; transactionId: number; status: 'Pending' | 'OnHold'; sanctionHit: boolean; receiverSanctionHit?: boolean }
  | { ok: false; code: 'DUPLICATE' | 'KYC_BLOCKED' | 'RISK_COUNTRY' | 'LIMIT_EXCEEDED'; message: string };

export interface MaskedRecipient {
  name: string;
  phone: string;
  email: string;
  customerId?: number;
  isRegistered: boolean;
}
