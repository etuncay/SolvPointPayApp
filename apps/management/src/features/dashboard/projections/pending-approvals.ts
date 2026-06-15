import { pendingApprovalWidgetRows } from '@/features/approval-pool/api/mock-approvals-adapter';
import type { CurrentUser } from '@/features/approval-pool/domain/types'; // persona + onay yetkileri
import type { ApprovalRow } from '../domain/types';

export function projectPendingApprovals(user: CurrentUser): ApprovalRow[] {
  return pendingApprovalWidgetRows(user);
}
