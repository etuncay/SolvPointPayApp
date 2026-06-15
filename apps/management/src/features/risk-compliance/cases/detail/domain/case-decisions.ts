import type { CaseStatus } from '../../domain/types';

/** Onay — MVP varsayılan çözüm */
export function statusAfterApprove(): CaseStatus {
  return 'Resolved_NoIssue';
}

export function statusAfterReject(): CaseStatus {
  return 'Rejected';
}

export function statusAfterRoute(): CaseStatus {
  return 'Assigned';
}
