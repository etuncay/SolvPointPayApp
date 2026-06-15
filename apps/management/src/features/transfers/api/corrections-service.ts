import type { BackOfficeRole } from '@epay/ui';
import type {
  CorrectionActionResult,
  CorrectionDraft,
  CreateCorrectionDraftInput,
  CreateCorrectionDraftResult,
} from '../domain/correction-types';

export type CorrectionsService = {
  createDraft(input: CreateCorrectionDraftInput, role: BackOfficeRole): CreateCorrectionDraftResult;
  updateDraft(
    correctionId: number,
    input: CreateCorrectionDraftInput,
    role: BackOfficeRole,
  ): CreateCorrectionDraftResult;
  getDraft(correctionId: number, role: BackOfficeRole): CorrectionDraft | null;
  attachDocument(
    correctionId: number,
    fileName: string,
    role: BackOfficeRole,
  ): CorrectionActionResult & { documentId?: number };
  submitToApproval(transactionId: number, role: BackOfficeRole): CorrectionActionResult;
  lookupTransaction(txNo: string, role: BackOfficeRole): import('@/mocks/transactions').Transaction | null;
};
