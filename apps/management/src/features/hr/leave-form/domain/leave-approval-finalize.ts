import type { ApprovalRequest } from '@/features/approval-pool/domain/types';
import { getLeaveById, updateLeaveRecord } from '@/mocks/employee-leaves';
import { getHrLeaveParams } from '@/features/hr/leaves/domain/hr-leave-params';
import { computeTotalDays } from './compute-total-days';
import { computeWorkingDays } from './compute-working-days';
import { parseLeaveApprovalEntity } from './leave-approval-entity';

type LookupApproval = (id: number) => ApprovalRequest | null;

let lookupApproval: LookupApproval = () => null;

export function registerLeaveApprovalLookup(fn: LookupApproval): void {
  lookupApproval = fn;
}

function recomputeDays(start: string, end: string): { totalDays: number; workingDays: number } {
  const params = getHrLeaveParams();
  return {
    totalDays: computeTotalDays(start, end),
    workingDays: computeWorkingDays(start, end, params.publicHolidays),
  };
}

export function applyLeaveApprovalIfNeeded(approvalId: number): void {
  const approval = lookupApproval(approvalId);
  if (!approval) return;
  const screenKey = approval.payload.screenKey;
  if (screenKey !== 'hr_leave_request' && screenKey !== 'hr_leave_cancel') return;

  const entity = parseLeaveApprovalEntity(approval);
  if (!entity) return;

  const leave = getLeaveById(entity.id);
  if (!leave) return;

  if (approval.uiStatus === 'approved') {
    if (entity.action === 'create') {
      updateLeaveRecord(entity.id, { taskStatus: 'Approved', approvalRequestId: null });
      return;
    }
    const meta = entity.cancelMeta;
    if (!meta) return;
    if (meta.cancelType === 'full') {
      updateLeaveRecord(entity.id, {
        taskStatus: 'Canceled',
        cancelType: 'full',
        notes: meta.notes || leave.notes,
        approvalRequestId: null,
      });
      return;
    }
    const days = recomputeDays(meta.proposedStart, meta.proposedEnd);
    updateLeaveRecord(entity.id, {
      startDate: meta.proposedStart,
      endDate: meta.proposedEnd,
      totalDays: days.totalDays,
      workingDays: days.workingDays,
      notes: meta.notes || leave.notes,
      taskStatus: 'Approved',
      cancelType: 'partial',
      approvalRequestId: null,
    });
    return;
  }

  if (approval.uiStatus === 'rejected' || approval.uiStatus === 'second_rejected') {
    if (entity.action === 'create') {
      updateLeaveRecord(entity.id, { taskStatus: 'Rejected', approvalRequestId: null });
      return;
    }
    updateLeaveRecord(entity.id, {
      taskStatus: 'Approved',
      cancelType: 'none',
      approvalRequestId: null,
    });
    return;
  }

  if (approval.uiStatus === 'withdrawn') {
    if (entity.action === 'create') {
      updateLeaveRecord(entity.id, { taskStatus: 'Rejected', approvalRequestId: null });
      return;
    }
    updateLeaveRecord(entity.id, { taskStatus: 'Approved', approvalRequestId: null, cancelType: 'none' });
  }
}
