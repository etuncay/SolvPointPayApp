export const FRAUD_VERDICTS = ['Unknown', 'NotFraud', 'ConfirmedFraud', 'PreventedFraud'] as const;
export type FraudVerdict = (typeof FRAUD_VERDICTS)[number];

export const FRAUD_TYPES = [
  'IdentityTheft',
  'AccountTakeover',
  'SocialEngineering',
  'MoneyMule',
  'PhishingScam',
  'Other',
] as const;
export type FraudType = (typeof FRAUD_TYPES)[number];

export const FRAUD_DETECTION_SOURCES = [
  'RuleEngine',
  'ManualReview',
  'CustomerReport',
  'AgentReport',
  'ExternalNotification',
  'Other',
] as const;
export type FraudDetectionSource = (typeof FRAUD_DETECTION_SOURCES)[number];

export type FraudRecord = {
  id: string;
  transactionId: number;
  /** Kullanıcıya gösterilen işlem no (alias dahil) */
  transactionNo: string;
  fraudType: FraudType | null;
  detectionSource: FraudDetectionSource;
  verdict: FraudVerdict;
  discoveryAt: string;
  lossAmount: number;
  recoveredAmount: number;
  linkedCaseId: string | null;
  notes: string;
  labelerUserId: string;
  updatedAt: string;
};

export type FraudRecordInput = {
  transactionNo: string;
  fraudType: FraudType | '' | null;
  detectionSource: FraudDetectionSource;
  verdict: FraudVerdict;
  discoveryAt: string;
  lossAmount: number;
  recoveredAmount: number;
  notes: string;
};

export type FraudRecordLookup = {
  transactionId: number;
  transactionNo: string;
  transactionDate: string;
  record: FraudRecord | null;
  linkedCaseId: string | null;
};

export type FraudRecordSaveResult = {
  ok: boolean;
  error?: string;
  recordId?: string;
  caseId?: string;
  /** Kaydet+Vaka: mevcut vaka varken yalnızca kayıt */
  caseSkipped?: boolean;
};

export const EMPTY_FRAUD_RECORD_INPUT: FraudRecordInput = {
  transactionNo: '',
  fraudType: '',
  detectionSource: 'ManualReview',
  verdict: 'Unknown',
  discoveryAt: '',
  lossAmount: 0,
  recoveredAmount: 0,
  notes: '',
};
