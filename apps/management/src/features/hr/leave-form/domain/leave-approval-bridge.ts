import { approvalsService } from '@/features/approval-pool/api';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import type { BackOfficeRole } from '@epay/ui';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { resolveManagerUserId } from '@/mocks/employee-managers';
import { buildCancelLeaveChanges, buildCreateLeaveChanges } from './build-leave-payload';
import type { LeaveApprovalEntityRef } from './leave-approval-entity';
import type { LeaveCancelMeta } from './types';
import type { LeaveType } from '@/features/hr/leaves/domain/types';

function formatRange(start: string, end: string): string {
  return start === end ? start : `${start} – ${end}`;
}

export function createLeaveRequestApproval(
  leaveId: string,
  employeeId: string,
  leaveType: LeaveType,
  start: string,
  end: string,
  workingDays: number,
  role: BackOfficeRole,
): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(role);
  const managerId = resolveManagerUserId(employeeId);
  const entity: LeaveApprovalEntityRef = { type: 'employee_leave', id: leaveId, action: 'create' };
  return approvalsService.createRequest({
    screenKey: 'hr_leave_request',
    screenName: 'Personel İzin Talebi',
    initiatedBy: user,
    requiredApprovals: 2,
    payload: {
      screenKey: 'hr_leave_request',
      summary: `${formatRange(start, end)} — ${leaveType}`,
      changes: buildCreateLeaveChanges(leaveType, start, end, workingDays),
      raw: {
        ...entity,
        firstApproverId: managerId,
        secondApproverId: MOCK_USER_IDS.management,
      },
    },
  });
}

export function createLeaveCancelApproval(
  leaveId: string,
  employeeId: string,
  leaveType: LeaveType,
  oldStart: string,
  oldEnd: string,
  meta: LeaveCancelMeta,
  workingDays: number,
  role: BackOfficeRole,
): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(role);
  const managerId = resolveManagerUserId(employeeId);
  const entity: LeaveApprovalEntityRef = {
    type: 'employee_leave',
    id: leaveId,
    action: 'cancel',
    cancelMeta: meta,
  };
  return approvalsService.createRequest({
    screenKey: 'hr_leave_cancel',
    screenName: 'Personel İzin İptali',
    initiatedBy: user,
    requiredApprovals: 2,
    payload: {
      screenKey: 'hr_leave_cancel',
      summary:
        meta.cancelType === 'full'
          ? 'Tam iptal talebi'
          : `İptal: ${formatRange(meta.proposedStart, meta.proposedEnd)}`,
      changes: buildCancelLeaveChanges(
        leaveType,
        oldStart,
        oldEnd,
        meta.proposedStart,
        meta.proposedEnd,
        workingDays,
        meta.cancelType === 'full',
      ),
      raw: {
        ...entity,
        firstApproverId: managerId,
        secondApproverId: MOCK_USER_IDS.management,
      },
    },
  });
}

export { applyLeaveApprovalIfNeeded } from './leave-approval-finalize';
