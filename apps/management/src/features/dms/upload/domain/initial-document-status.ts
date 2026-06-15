import type { ApprovalStatus, DocumentStatus } from '@/features/dms/domain/types';

/** approval_required → ilk statü — spec §8 */
export function resolveInitialDocumentStatus(approvalRequired: boolean): {
  documentStatus: DocumentStatus;
  approvalStatus: ApprovalStatus;
} {
  if (approvalRequired) {
    return { documentStatus: 'Inactive', approvalStatus: 'Pending' };
  }
  return { documentStatus: 'Active', approvalStatus: null };
}
