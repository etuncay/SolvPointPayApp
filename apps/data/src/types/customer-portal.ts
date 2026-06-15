/** Müşteri self-servis uygulaması veri modelleri */

import type {
  CurrencyCode,
  CustomerPortalDirection,
  CustomerPortalTransactionStatus,
  CustomerType,
  TransferKind,
  WalletType,
} from '@epay/domain';

export type {
  CustomerType,
  WalletType,
  CurrencyCode,
  TransferKind,
  CustomerPortalDirection,
  CustomerPortalTransactionStatus,
};

/** Müşteri portalı API / UI alias'ları */
export type TransactionDirection = CustomerPortalDirection;
export type TransactionStatus = CustomerPortalTransactionStatus;

export interface CustomerProfile {
  id: string;
  name: string;
  customerNo: string;
  type: CustomerType;
  initials: string;
  welcomeMessage: string;
  email: string;
  phone: string;
  lastLogin: string;
  /** Tüzel müşteride işlemi yapan yetkili kişi (İşlem Onay 1.1) */
  authorizedPersonNo?: string;
  authorizedPersonName?: string;
  failedAttempt?: {
    when: string;
    ip: string;
    city: string;
  };
}

export interface CustomerWallet {
  id: string;
  type: WalletType;
  label: string;
  walletNo: string;
  currency: CurrencyCode;
  symbol: string;
  balance: number;
  editable: boolean;
  accent?: string;
}

export interface CustomerTransaction {
  id: string;
  date: string;
  direction: TransactionDirection;
  type: string;
  counterparty: string;
  counterpartyNo?: string;
  account?: string;
  iban?: string;
  referenceNo: string;
  currency: CurrencyCode;
  symbol: string;
  amount: number;
  balanceAfter: number;
  status: TransactionStatus;
  description?: string;
  purpose?: string;
  country?: string;
  fxRate?: string;
  walletId?: string;
}

export interface SavedRecipient {
  id: string;
  label: string;
  name: string;
  country: string;
  isIntl: boolean;
  phone?: string;
  email?: string;
  customerNo?: string;
  purpose?: string;
  description?: string;
  recordStatus: 0 | 1;
  createdAt: string;
  updatedAt: string;
}

export interface OwnIban {
  id: string;
  iban: string;
  bank: string;
  currency: CurrencyCode;
  walletId: string;
  walletNo: string;
}

export interface TransferFee {
  id: string;
  range: string;
  fixed: string;
  rate: string;
  currency: CurrencyCode;
  campaign?: string;
}

export interface FxQuote {
  pair: string;
  rate: number;
  expiresAt: string;
}

export interface CustomerSettings {
  customerId: string;
  language: 'tr' | 'en' | 'ar';
  theme: 'light' | 'dark';
  textSize: 's' | 'm' | 'l' | 'xl';
  welcomeMessage: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  dailyLimit: number;
  internetDailyLimit: number;
  monthlyLimit: number;
  corporateDailyMax: number;
  corporateMonthlyMax: number;
  monthlyIncome: number;
  education: string;
  employmentStatus: string;
  profession: string;
  employer: string;
  notifyMoneyIn: boolean;
  notifyMoneyOut: boolean;
  notifyLowBalance: boolean;
  lowBalanceThreshold: number;
  smsNotify: boolean;
  emailNotify: boolean;
  pushNotify: boolean;
  securityNotifyLocked: boolean;
}

/** İletişim Bilgileri (1.2 Ayarlar) — e-posta link, mobil OTP ile doğrulanır; sabit telefon doğrulanmaz */
export type ContactKind = 'email' | 'mobile' | 'landline';

export interface CustomerContact {
  id: string;
  kind: ContactKind;
  value: string;
  isPrimary: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInput {
  kind: ContactKind;
  value: string;
}

export interface ContactResendResult {
  ok: boolean;
  alreadyVerified?: boolean;
  rateLimited?: boolean;
}

export interface SupportCaseInput {
  type: string;
  reason: string;
  message: string;
  consent: boolean;
}

export interface SupportCaseRecord extends SupportCaseInput {
  id: string;
  caseNo: string;
  createdAt: string;
  status: string;
}

export interface TransferDraftInput {
  kind: TransferKind;
  title: string;
  sourceWalletId: string;
  recipientName: string;
  recipientCustomerNo?: string;
  phone?: string;
  email?: string;
  country: string;
  iban?: string;
  bank?: string;
  currency: CurrencyCode;
  symbol: string;
  amount: number;
  fee: number;
  total: number;
  purpose: string;
  description?: string;
  saveRecipient?: boolean;
  srcCurrency?: CurrencyCode;
  dstCurrency?: CurrencyCode;
  fxRate?: number;
  netAmount?: number;
  dstSymbol?: string;
}

export interface TransferConfirmation {
  transactionId: string;
  /** Onay ekranında gösterilen referans; işlem oluşturulurken bir kez üretilir */
  referenceNo: string;
  /** Yurt dışı işlemlerde partner referansı (yalnızca intl) */
  foreignReferenceNo?: string;
  draft: TransferDraftInput;
  requiresDeclaration: boolean;
  otpSent: boolean;
}

export interface TransferApproveResult {
  transactionId: string;
  referenceNo: string;
  status: TransactionStatus;
  receiptAvailable: boolean;
}

export interface CustomerLoginInput {
  identity: string;
  password: string;
  taxNo?: string;
}

export interface CustomerLoginResult {
  ok: boolean;
  errorCode?: 'invalid_credentials' | 'no_persistent_wallet' | 'otp_required';
  profile?: CustomerProfile;
  requiresOtp?: boolean;
}

export interface CustomerOtpVerifyInput {
  identity: string;
  otp: string;
}

export interface TransactionsListQuery {
  direction?: 'all' | TransactionDirection;
  type?: string;
  walletId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'date' | 'amount';
  sortDir?: 'asc' | 'desc';
}

export interface PaginatedTransactions {
  items: CustomerTransaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TopupInstructions {
  companyName: string;
  companyIban: string;
  companyBank: string;
  customerReference: string;
  note: string;
}

export interface ReceiptRecord {
  transactionId: string;
  fileName: string;
  createdAt: string;
}
