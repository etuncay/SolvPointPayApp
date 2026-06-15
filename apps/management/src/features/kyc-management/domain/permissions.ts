import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { KycDecision, KycPermissions, KycReview } from './types';

export function getKycPermissions(role: BackOfficeRole): KycPermissions {
  if (isAllAccessRole(role)) {
    return {
      list: true,
      detail: true,
      falsePositive: true,
      requestAdditional: true,
      reject: true,
      verifySubmit: true,
      verifyFinalize: true,
      addDocument: true,
    };
  }
  if (role === 'compliance') {
    return {
      list: true,
      detail: true,
      falsePositive: true,
      requestAdditional: true,
      reject: true,
      verifySubmit: true,
      verifyFinalize: false,
      addDocument: true,
    };
  }
  if (role === 'management') {
    return {
      list: false,
      detail: true,
      falsePositive: false,
      requestAdditional: false,
      reject: false,
      verifySubmit: false,
      verifyFinalize: true,
      addDocument: false,
    };
  }
  return {
    list: false,
    detail: false,
    falsePositive: false,
    requestAdditional: false,
    reject: false,
    verifySubmit: false,
    verifyFinalize: false,
    addDocument: false,
  };
}

export function canActOnReview(review: KycReview): boolean {
  return review.decision == null || review.decision === 'RequestAdditional';
}

export function showVerifyFinalize(review: KycReview, role: BackOfficeRole): boolean {
  return (
    (role === 'management' || isAllAccessRole(role)) &&
    review.decision === 'PendingVerification'
  );
}

export function isDecisionLocked(decision: KycDecision): boolean {
  return decision === 'Verified' || decision === 'Rejected' || decision === 'FalsePositive';
}
