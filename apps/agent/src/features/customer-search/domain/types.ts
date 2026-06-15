/** Müşteri arama sorgusu — en az bir alan dolu olmalı. */
export interface CustomerSearchQuery {
  customerNo?: string;
  idNo?: string;
}

export interface CustomerSearchWarning {
  code: string;
  message: string;
}

/** §5 müşteri bilgileri paneli satırı. */
export interface CustomerProfilePanel {
  customerId: number;
  customerNo: string;
  fullName: string;
  idNo: string;
  kycLevel: string;
  riskSegment: string;
  primaryPhone: string;
  primaryEmail: string;
  city: string;
  district: string;
  membershipDate: string;
  campaign: string | null;
  campaignEndDate: string | null;
  status: string;
  statusReason: string | null;
  isSuspicious: boolean;
}

export interface CustomerAccountRow {
  walletId: number;
  walletNo: string;
  availableBalance: number;
  currency: string;
  withdrawalLimit: number | null;
  transferLimit: number | null;
  internationalLimit: number | null;
}

export interface CustomerPendingTxRow {
  transactionId: number;
  transactionNo: string;
  createdAt: string;
  transactionType: string;
  currency: string;
  amount: number;
  status: string;
  senderName: string;
  receiverName: string;
  description: string | null;
}

export interface CustomerDocumentViewRow {
  id: string;
  category: string;
  type: string;
  validFrom: string | null;
  validTo: string | null;
  documentStatus: string;
  approvalStatus: string;
  validityLabel: string;
  fileName: string;
}

export interface CustomerSearchResult {
  profile: CustomerProfilePanel;
  warnings: CustomerSearchWarning[];
}

export interface DocumentUploadInput {
  category: string;
  type: string;
  validFrom?: string;
  validTo?: string;
  fileName: string;
}
