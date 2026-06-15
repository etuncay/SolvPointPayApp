export const CORRECTION_REASONS = [
  'Refund',
  'Cancellation',
  'OperationalError',
  'ComplaintResolution',
  'Reconciliation',
  'Other',
] as const;

export type CorrectionReason = (typeof CORRECTION_REASONS)[number];

export type CorrectionCurrency = 'TRY' | 'USD' | 'EUR' | 'GBP';

export type CorrectionDocument = {
  id: number;
  correctionId: number;
  fileName: string;
  uploadedAt: string;
};

export type CorrectionFormValues = {
  complaintId: string;
  sourceTransactionNo: string;
  sourceCustomerId: number | null;
  sourceWalletId: number | null;
  targetCustomerId: number | null;
  targetWalletId: number | null;
  requestedAmount: number;
  requestedCurrency: CorrectionCurrency;
  transactionDescription: string;
  correctionReason: CorrectionReason | '';
  manualDescription: string;
};

export const EMPTY_CORRECTION_FORM: CorrectionFormValues = {
  complaintId: '',
  sourceTransactionNo: '',
  sourceCustomerId: null,
  sourceWalletId: null,
  targetCustomerId: null,
  targetWalletId: null,
  requestedAmount: 0,
  requestedCurrency: 'TRY',
  transactionDescription: '',
  correctionReason: '',
  manualDescription: '',
};

export type CorrectionFxPreview = {
  sourceOutAmount: number;
  sourceOutCurrency: CorrectionCurrency;
  targetInAmount: number;
  targetInCurrency: CorrectionCurrency;
  amountTryEquivalent: number;
};

export type CorrectionDraft = CorrectionFormValues & {
  id: number;
  draftTransactionId: number;
  sourceOutAmount: number;
  targetInAmount: number;
  documentId: number | null;
  documentFileName: string | null;
  submittedToApproval: boolean;
  approvalId: number | null;
  createdBy: string;
  createdAt: string;
};

export type CreateCorrectionDraftInput = CorrectionFormValues;

export type CreateCorrectionDraftResult =
  | { ok: true; correctionId: number; transactionId: number }
  | { ok: false; error: string };

export type CorrectionActionResult = { ok: boolean; error?: string; approvalId?: number };
