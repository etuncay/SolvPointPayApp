import type { TransactionDetail } from './transaction-detail';

/** 1.1 ekranı çalışma modu — Onay (form) veya Detay (salt-okunur). */
export type ConfirmationMode = 'Approve' | 'Detail';

/** Temsilcinin bu işlemdeki rolü — dekont "işlem noktası" alanında kullanılır. */
export type AgentRole = 'Sender' | 'Receiver' | null;

/** §5 Güvenlik paneli — onay için doldurulması gereken kontroller. */
export type SecurityChecks = {
  identityChecked: boolean;
  photoMatched: boolean;
  /** Yalnızca işlem tüzel kişi adına ise anlamlı. */
  authorityChecked: boolean;
  noSuspicion: boolean;
};

/** §8 İşlem Beyanı — risk=Kritik işlemlerde immutable kaydedilir. */
export type DeclarationReason = 'Family' | 'Commercial' | 'Gift' | 'Other' | 'Unknown';

export type DeclarationInput = {
  relation: string;
  reason: DeclarationReason;
  /** Reason = Other/Unknown ise zorunlu kısa açıklama. */
  note: string;
};

export type ApproveInput = {
  otp: string;
  checks: SecurityChecks;
  declaration?: DeclarationInput;
};

/** 1.1 ekranının ihtiyaç duyduğu özet + bayraklar. */
export type ConfirmationView = {
  id: number;
  detail: TransactionDetail;
  /** İşlem tüzel kişi adına mı — Yetki kontrolü checkbox'ını zorunlu kılar. */
  requiresAuthority: boolean;
  /** Risk=Kritik → onayda İşlem Beyanı modalı zorunlu. */
  isCritical: boolean;
  /** Dekont üretilmiş mi — Detay Modu'nda indirme butonunu aktive eder. */
  hasReceipt: boolean;
  agentRole: AgentRole;
};

export type ApproveResult = { ok: boolean; error?: string };

/** Ana Sayfa — Bekleyen İşlemler paneli satırı (§5). */
export type PendingTransactionRow = {
  id: number;
  transactionNo: string;
  createdAt: string;
  senderName: string;
  receiverName: string;
  iban: string | null;
  transactionType: string;
  amount: number;
  currency: string;
  description: string | null;
  referenceNo: string;
  status: string;
};

/** Ana Sayfa — Bekleyen Müşteriler paneli satırı (§5). */
export type PendingCustomerRow = {
  customerId: number;
  createdAt: string;
  customerNo: number;
  idNo: string;
  name: string;
  status: string;
};

/** 1.3 Ayarlar › Dekontlarım satırı. */
export type AgentReceiptRow = {
  transactionId: number;
  transactionNo: string;
  date: string;
  amount: number;
  currency: string;
};

/** Günlük grafik agregasyonu için ham işlem kaydı. */
export type AgentTransactionSeed = {
  createdAt: string;
  amount: number;
  success: boolean;
};
