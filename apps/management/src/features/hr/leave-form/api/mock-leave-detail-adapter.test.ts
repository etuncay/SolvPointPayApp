import { beforeEach, describe, expect, it } from 'vitest';
import { resetApprovalsStore } from '@/features/approval-pool/api/mock-approvals-adapter';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { approvalsService } from '@/features/approval-pool/api';
import { applyLeaveApprovalIfNeeded } from '../domain/leave-approval-bridge';
import { resetEmployeeLeavesStore, getLeaveById } from '@/mocks/employee-leaves';
import { leaveDetailService } from './mock-leave-detail-adapter';

describe('mock-leave-detail-adapter', () => {
  beforeEach(() => {
    resetEmployeeLeavesStore();
    resetApprovalsStore();
  });

  it('partial cancel updates dates after dual approval', () => {
    const leave = getLeaveById('LV-001')!;
    const submitted = leaveDetailService.submitCancel(
      leave.id,
      {
        leaveType: leave.leaveType,
        startDate: '2026-03-11',
        endDate: '2026-03-13',
        notes: 'Kısmi iptal',
        cancelFull: false,
      },
      'ops',
      'emp-001',
    );
    expect(submitted.ok).toBe(true);
    if (!submitted.ok) return;

    approvalsService.approve(submitted.approvalId, getCurrentUser('compliance'), 'ok');
    applyLeaveApprovalIfNeeded(submitted.approvalId);
    approvalsService.approve(submitted.approvalId, getCurrentUser('management'), 'ok');
    applyLeaveApprovalIfNeeded(submitted.approvalId);

    const updated = getLeaveById('LV-001')!;
    expect(updated.startDate).toBe('2026-03-11');
    expect(updated.endDate).toBe('2026-03-13');
    expect(updated.taskStatus).toBe('Approved');
  });
});
