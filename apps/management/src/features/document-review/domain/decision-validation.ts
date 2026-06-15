import i18n from 'i18next';
import type {
  ApprovePayload,
  RejectPayload,
  RequestAdditionalPayload,
  ReviewCustomerSummary,
} from './types';

export type ValidationWarning = {
  code: string;
  message: string;
};

export type ValidationResult = {
  ok: boolean;
  error?: string;
  warnings: ValidationWarning[];
};

function hasApprovedCategory(
  customer: ReviewCustomerSummary,
  category: string,
): boolean {
  return customer.documents.some(
    (d) =>
      d.category === category &&
      (d.status === 'approved' || d.status === 'Active' || d.approvalStatus === 'Approved'),
  );
}

/** KYC L2/L3 yükseltme koşulu — spec §8 */
export function canSelectKycLevel(customer: ReviewCustomerSummary, level: string): boolean {
  if (level === 'L1' || level === 'L0') return true;
  if (level === 'L2') {
    return hasApprovedCategory(customer, 'ProofOfAddress') || hasApprovedCategory(customer, 'AddressProof');
  }
  if (level === 'L3') {
    return hasApprovedCategory(customer, 'ProofOfFunds');
  }
  return true;
}

export function validateApprove(
  payload: ApprovePayload,
  customer: ReviewCustomerSummary,
): ValidationResult {
  const warnings: ValidationWarning[] = [];

  if ((payload.entityStatus === 'blocked' || payload.entityStatus === 'closed') && !payload.statusReason?.trim()) {
    return { ok: false, error: 'dr_reason_required', warnings: [] };
  }

  if (customer.customerType === 'individual' && payload.kycLevel) {
    if (!canSelectKycLevel(customer, payload.kycLevel)) {
      return { ok: false, error: 'dr_kyc_level_blocked', warnings: [] };
    }
  }

  if (payload.kycStatus === 'Approved' && (payload.entityStatus === 'blocked' || payload.entityStatus === 'closed')) {
    warnings.push({ code: 'dr_warn_kyc_approved_blocked', message: 'dr_warn_kyc_approved_blocked' });
  }

  if (
    customer.customerType === 'individual' &&
    payload.kycLevel &&
    parseInt(payload.kycLevel.replace('L', ''), 10) >
      parseInt((customer.kycLevel ?? 'L0').replace('L', ''), 10) &&
    (payload.entityStatus === 'blocked' || payload.entityStatus === 'closed')
  ) {
    warnings.push({ code: 'dr_warn_level_up_blocked', message: 'dr_warn_level_up_blocked' });
  }

  const pendingOthers = customer.documents.filter(
    (d) => d.approvalStatus === 'Pending' || d.status === 'pending',
  );
  if (pendingOthers.length > 1) {
    warnings.push({ code: 'dr_warn_pending_docs', message: 'dr_warn_pending_docs' });
  }

  if (payload.entityStatus === 'closed') {
    warnings.push({ code: 'dr_warn_close', message: 'dr_warn_close' });
  }

  return { ok: true, warnings };
}

export function validateReject(payload: RejectPayload): ValidationResult {
  if (!payload.comment.trim()) {
    return { ok: false, error: 'dr_comment_required', warnings: [] };
  }
  return { ok: true, warnings: [] };
}

export function validateRequestAdditional(payload: RequestAdditionalPayload): ValidationResult {
  if (!payload.category || !payload.documentType.trim()) {
    return { ok: false, error: 'dr_additional_doc_required', warnings: [] };
  }
  return { ok: true, warnings: [] };
}

export function confirmWarnings(warnings: ValidationWarning[]): boolean {
  if (warnings.length === 0) return true;
  if (typeof window === 'undefined' || typeof window.confirm !== 'function') return true;
  const msg = warnings.map((w) => i18n.t(w.message)).join('\n\n');
  return window.confirm(msg);
}
