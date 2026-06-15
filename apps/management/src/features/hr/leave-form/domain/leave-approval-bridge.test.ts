import { beforeEach, describe, expect, it } from 'vitest';
import { approvalsService } from '@/features/approval-pool/api';
import { resetApprovalsStore } from '@/features/approval-pool/api/mock-approvals-adapter';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { resetEmployeeLeavesStore, getLeaveById } from '@/mocks/employee-leaves';
import { applyLeaveApprovalIfNeeded } from './leave-approval-bridge';
import { leaveDetailService } from '../api/mock-leave-detail-adapter';

describe('leave-approval-bridge', () => {
  beforeEach(() => {
    resetEmployeeLeavesStore();
    resetApprovalsStore();
  });

  it('create → 2 approvals → Approved leave', () => {
    const created = leaveDetailService.create(
      {
        leaveType: 'AnnualLeave',
        startDate: '2026-07-01',
        endDate: '2026-07-03',
        notes: 'Tatil',
        cancelFull: false,
      },
      'ops',
      'emp-001',
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const first = getCurrentUser('compliance');
    const second = getCurrentUser('management');
    approvalsService.approve(created.approvalId, first, '1. onay');
    applyLeaveApprovalIfNeeded(created.approvalId);
    let leave = getLeaveById(created.leaveId)!;
    expect(leave.taskStatus).toBe('Pending');

    approvalsService.approve(created.approvalId, second, '2. onay');
    applyLeaveApprovalIfNeeded(created.approvalId);
    leave = getLeaveById(created.leaveId)!;
    expect(leave.taskStatus).toBe('Approved');
  });

  it('reject create sets leave Rejected', () => {
    const created = leaveDetailService.create(
      {
        leaveType: 'SickLeave',
        startDate: '2026-08-01',
        endDate: '2026-08-02',
        notes: '',
        cancelFull: false,
      },
      'ops',
      'emp-001',
    );
    if (!created.ok) return;
    const user = getCurrentUser('compliance');
    approvalsService.reject(created.approvalId, user, 'Red');
    applyLeaveApprovalIfNeeded(created.approvalId);
    expect(getLeaveById(created.leaveId)?.taskStatus).toBe('Rejected');
  });
});
