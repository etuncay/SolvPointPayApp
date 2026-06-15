import type { DocumentCustomerType, EntityLifecycleStatusWithProspect } from '@epay/domain';

export type DocumentCategory =
  | 'Identity'
  | 'ProofOfAddress'
  | 'ProofOfFunds'
  | 'LegalEntity'
  | 'ProofOfTransaction'
  | 'Agreement'
  | 'EmployeeHR';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | null;
export type DocumentStatus = 'Inactive' | 'Active' | 'Rejected' | 'Expired' | 'Archived';
export type { DocumentCustomerType as CustomerType };
export type EntityStatus = EntityLifecycleStatusWithProspect;
export type KycStatus = 'Pending' | 'Approved' | 'Rejected' | null;

/** dms.document satırı */
export type ReviewDocumentRow = {
  id: number;
  customerId: number;
  customerNo: string;
  customerName: string;
  nationality: string;
  suspiciousFlag: boolean;
  customerType: DocumentCustomerType;
  category: DocumentCategory;
  documentType: string;
  approvalRequired: boolean;
  approvalStatus: ApprovalStatus;
  documentStatus: DocumentStatus;
  createdAt: string;
  createdBy: string;
  approvedAt: string | null;
  approvedBy: string | null;
  recordStatus: number;
};

export type ReviewQueueItem = ReviewDocumentRow;

export type ReviewQueueFilters = {
  query: string;
  customerNo: string;
  category: string;
  documentType: string;
  approvalStatus: string;
};

export const DEFAULT_QUEUE_FILTERS: ReviewQueueFilters = {
  query: '',
  customerNo: '',
  category: 'any',
  documentType: 'any',
  approvalStatus: 'any',
};

export type DocumentReviewPermissions = {
  list: boolean;
  view: boolean;
  approve: boolean;
  reject: boolean;
  requestAdditional: boolean;
};

export type ReviewLogEntry = {
  id: number;
  documentId: number;
  decision: 'approve' | 'reject' | 'request_additional';
  decidedBy: string;
  decidedAt: string;
  comment: string;
  requestedCategory?: string;
  requestedType?: string;
};

/** Detay ekranı — müşteri özeti */
export type ReviewCustomerSummary = {
  customerId: number;
  customerNo: string;
  customerName: string;
  customerType: DocumentCustomerType;
  idType: string;
  idNo: string;
  nationality: string;
  birthDate: string;
  birthPlace: string;
  maritalStatus: string;
  serialNo: string;
  issueDate: string;
  issuingAuthority: string;
  validityDate: string;
  motherName: string;
  fatherName: string;
  gender: string;
  language: string;
  notes: string;
  kycLevel: string | null;
  kycStatus: string;
  status: string;
  statusReason: string | null;
  createdAt: string;
  approvalStatus: string;
  documents: { category: string; type: string; status: string; approvalStatus: string }[];
};

export type ReviewDocumentDetail = {
  document: ReviewDocumentRow;
  customer: ReviewCustomerSummary;
  reviewLog: ReviewLogEntry[];
};

export type ApprovePayload = {
  kycStatus: KycStatus | 'unchanged';
  entityStatus: EntityStatus;
  kycLevel?: string;
  statusReason?: string | null;
  comment: string;
};

export type RejectPayload = {
  kycStatus: KycStatus | 'unchanged';
  kycLevel?: string;
  comment: string;
};

export type RequestAdditionalPayload = {
  category: DocumentCategory;
  documentType: string;
  comment: string;
};

export type DecisionResult = {
  ok: boolean;
  error?: string;
  warnings?: string[];
};

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'Identity',
  'ProofOfAddress',
  'ProofOfFunds',
  'LegalEntity',
  'ProofOfTransaction',
  'Agreement',
  'EmployeeHR',
];

export const DOCUMENT_TYPES_BY_CATEGORY: Record<DocumentCategory, string[]> = {
  Identity: ['TC Kimlik Kartı (Ön)', 'TC Kimlik Kartı (Arka)', 'Pasaport', 'İkamet İzni Belgesi'],
  ProofOfAddress: ['İkametgah Belgesi', 'Fatura', 'Kira Sözleşmesi'],
  ProofOfFunds: ['Maaş Bordrosu', 'Banka Ekstresi', 'Vergi Beyannamesi'],
  LegalEntity: ['TaxCertificate', 'SignatureCircular', 'TradeRegistryGazette', 'ArticlesOfAssociation'],
  ProofOfTransaction: ['İmzalı Dekont', 'Havale Makbuzu'],
  Agreement: ['Müşteri Sözleşmesi', 'KVKK Aydınlatma'],
  EmployeeHR: ['İş Sözleşmesi', 'SGK Bildirgesi'],
};
