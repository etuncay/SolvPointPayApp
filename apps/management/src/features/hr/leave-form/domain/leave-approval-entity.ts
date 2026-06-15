import type { ApprovalRequest } from '@/features/approval-pool/domain/types';
import type { LeaveCancelMeta } from './types';

export type LeaveApprovalEntityRef = {
  type: 'employee_leave';
  id: string;
  action: 'create' | 'cancel';
  cancelMeta?: LeaveCancelMeta;
};

export function parseLeaveApprovalEntity(approval: ApprovalRequest): LeaveApprovalEntityRef | null {
  const raw = approval.payload.raw as LeaveApprovalEntityRef | undefined;
  if (!raw || raw.type !== 'employee_leave' || !raw.id) return null;
  return raw;
}
