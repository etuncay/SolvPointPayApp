import type { CustomerSearchWarning } from '@/features/customer-search/domain/types';
import type { WalletKind } from '@/mocks/wallets';

import type { CustomerType } from '@epay/domain';

export type { CustomerType };

/** Kimlik tarama bölümü durumu (§5). */
export interface IdentityScanState {
  country: string;
  idType: string;
  birthDate: string;
  frontFile: string;
  backFile: string;
}

/** Alıcı cüzdanı — tutar kilidi kararında kullanılır (§8). */
export interface RecipientWallet {
  walletId: number;
  walletNo: string;
  currency: string;
  available: number;
  walletKind: WalletKind;
}

/** Tüzel müşteri yetkili kişisi (mock). */
export interface AuthorizedPerson {
  idNo: string;
  name: string;
}

/** GET /agent/customers/search — alıcı lookup sonucu. */
export interface RecipientLookupResult {
  customerId: number;
  customerNo: string;
  fullName: string;
  idNo: string;
  customerType: CustomerType;
  kycLevel: string;
  status: string;
  warnings: CustomerSearchWarning[];
  wallets: RecipientWallet[];
  authorizedPersons: AuthorizedPerson[];
  /** Bireysel aktif L1+ ve kimlik belgesi yoksa kimlik tarama bölümü gösterilir. */
  requiresIdentityScan: boolean;
  /** Tüzel müşteride onaylı belge eksikse inline uyarı + Belge Ekle. */
  documentMissing: boolean;
}

/** Para çekme ücret/komisyon kademesi. */
export interface WithdrawalFeeTier {
  id: string;
  currency: string;
  minAmount: number;
  maxAmount: number | null;
  fixedFee: number;
  /** Oransal komisyon yüzdesi (ör. 0.5 = %0,5). */
  rate: number;
  campaignEndDate: string | null;
}

export interface WithdrawalSubmitPayload {
  customerId: number;
  walletId: number;
  currency: string;
  amount: number;
  transactionReferenceNo: string;
  foreignReferenceNo?: string;
  isSuspicious: boolean;
  authorizedPersonIdNo?: string;
  /** Sanction taraması yapılacak gerçek kişi (bireysel alıcı veya tüzel yetkili). */
  screenIdNo: string;
  screenName: string;
}

export type WithdrawalSubmitResult =
  | { ok: true; transactionId: number; status: 'Pending' | 'OnHold'; sanctionHit: boolean }
  | { ok: false; code: 'DUPLICATE' | 'NOT_FOUND'; message: string };
