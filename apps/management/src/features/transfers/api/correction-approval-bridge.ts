import { approvalsService } from '@/features/approval-pool/api';
import type { ApprovalRequest } from '@/features/approval-pool/domain/types';
import { buildManualCorrectionFormConfig } from '../manual-correction-form-config';
import { buildApprovalChanges } from '@/features/approval-pool/domain/compute-changed-fields';
import { updateManualCorrectionTransaction } from './mock-transactions-adapter';

export type CorrectionApprovalMeta = {
  correctionId: number;
  transactionId: number;
  complaintId: string | null;
};

export function parseCorrectionApprovalMeta(approval: ApprovalRequest): CorrectionApprovalMeta | null {
  if (approval.payload.screenKey !== '5.2') return null;
  const raw = approval.payload.raw as CorrectionApprovalMeta | undefined;
  if (!raw?.transactionId) return null;
  return raw;
}

export type CorrectionApprovalApplyFn = (meta: CorrectionApprovalMeta) => void;

let applyHandler: CorrectionApprovalApplyFn | null = null;

export function registerCorrectionApprovalApply(fn: CorrectionApprovalApplyFn): void {
  applyHandler = fn;
}

export function applyCorrectionApprovalIfNeeded(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  const meta = parseCorrectionApprovalMeta(approval);
  if (!meta) return;
  applyHandler?.(meta);
}

/** Manuel düzeltme onay payload'ına formKey + correction form değerleri ekler. */
export function enrichCorrectionApprovalPayload(
  draft: {
    requestedAmount: number;
    requestedCurrency: string;
    correctionReason: string;
    manualDescription: string;
    transactionDescription: string;
    sourceCustomerId: number | null;
    targetCustomerId: number | null;
  },
  _raw: CorrectionApprovalMeta,
): {
  formKey: string;
  newValues: Record<string, unknown>;
  changes: ReturnType<typeof buildApprovalChanges>;
} {
  const newValues: Record<string, unknown> = {
    requestedAmount: draft.requestedAmount,
    requestedCurrency: draft.requestedCurrency,
    correctionReason: draft.correctionReason,
    manualDescription: draft.manualDescription,
    transactionDescription: draft.transactionDescription,
    sourceCustomerId: draft.sourceCustomerId,
    targetCustomerId: draft.targetCustomerId,
  };
  const config = buildManualCorrectionFormConfig();
  return {
    formKey: 'manual_correction',
    newValues,
    changes: buildApprovalChanges(config, newValues),
  };
}

export function finalizeCorrectionOnApprove(meta: CorrectionApprovalMeta): void {
  updateManualCorrectionTransaction(meta.transactionId, { status: 'Completed' });
}
