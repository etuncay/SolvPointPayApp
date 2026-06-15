import type { BackOfficeRole } from '@epay/ui';
import { getEmployeesListStore } from '@/mocks/employees';
import {
  allocateLeaveId,
  appendLeaveRecord,
  getLeaveById,
  updateLeaveRecord,
} from '@/mocks/employee-leaves';
import type { EmployeeLeave, LeaveCancelType } from '@/features/hr/leaves/domain/types';
import { getHrLeaveParams } from '@/features/hr/leaves/domain/hr-leave-params';
import { computeTotalDays } from '../domain/compute-total-days';
import { computeWorkingDays } from '../domain/compute-working-days';
import { validateLeaveForm } from '../domain/validation';
import {
  createLeaveCancelApproval,
  createLeaveRequestApproval,
} from '../domain/leave-approval-bridge';
import type { LeaveDetail, LeaveFormSubmitResult, LeaveFormValues } from '../domain/types';
import type { LeaveDetailService } from './leave-detail-service';

function toDetail(leave: EmployeeLeave): LeaveDetail {
  const emp = getEmployeesListStore().find((e) => e.employeeId === leave.employeeId);
  return {
    ...leave,
    employeeName: emp?.fullName ?? leave.employeeId,
    departmentName: emp?.departmentName ?? '—',
  };
}

function computeDays(start: string, end: string) {
  const params = getHrLeaveParams();
  return {
    totalDays: computeTotalDays(start, end),
    workingDays: computeWorkingDays(start, end, params.publicHolidays),
  };
}

export const leaveDetailService: LeaveDetailService = {
  getById(leaveId) {
    const leave = getLeaveById(leaveId);
    return leave ? toDetail(leave) : null;
  },

  create(values, role, employeeId) {
    const err = validateLeaveForm('create', values);
    if (err) return { ok: false, errorCode: err };

    const days = computeDays(values.startDate, values.endDate);
    if (days.totalDays < 1) return { ok: false, errorCode: 'lf_date_range_invalid' };

    const id = allocateLeaveId();
    const now = new Date().toISOString();
    appendLeaveRecord({
      id,
      employeeId,
      leaveType: values.leaveType,
      startDate: values.startDate,
      endDate: values.endDate,
      totalDays: days.totalDays,
      workingDays: days.workingDays,
      notes: values.notes.trim() || null,
      taskStatus: 'Pending',
      recordStatus: 1,
      createdAt: now,
      createdBy: employeeId,
      approvalRequestId: null,
      cancelType: 'none',
      originalStartDate: null,
      originalEndDate: null,
    });

    const approval = createLeaveRequestApproval(
      id,
      employeeId,
      values.leaveType,
      values.startDate,
      values.endDate,
      days.workingDays,
      role,
    );
    if (!approval.ok || approval.approvalId == null) {
      return { ok: false, errorCode: approval.error ?? 'rsc_approval_failed' };
    }
    updateLeaveRecord(id, { approvalRequestId: approval.approvalId });
    return { ok: true, leaveId: id, approvalId: approval.approvalId };
  },

  submitCancel(leaveId, values, role, employeeId) {
    const leave = getLeaveById(leaveId);
    if (!leave) return { ok: false, errorCode: 'lf_not_found' };
    if (leave.employeeId !== employeeId) return { ok: false, errorCode: 'lf_forbidden' };
    if (leave.taskStatus !== 'Approved') return { ok: false, errorCode: 'lf_not_approved' };

    const original = {
      start: leave.originalStartDate ?? leave.startDate,
      end: leave.originalEndDate ?? leave.endDate,
    };
    const err = validateLeaveForm('cancel', values, original);
    if (err) return { ok: false, errorCode: err };

    const cancelType: LeaveCancelType = values.cancelFull ? 'full' : 'partial';
    const proposedStart = values.cancelFull ? leave.startDate : values.startDate;
    const proposedEnd = values.cancelFull ? leave.startDate : values.endDate;
    const days = values.cancelFull
      ? { totalDays: 0, workingDays: 0 }
      : computeDays(proposedStart, proposedEnd);

    updateLeaveRecord(leaveId, {
      taskStatus: 'Pending',
      cancelType,
      originalStartDate: leave.originalStartDate ?? leave.startDate,
      originalEndDate: leave.originalEndDate ?? leave.endDate,
      approvalRequestId: null,
    });

    const approval = createLeaveCancelApproval(
      leaveId,
      employeeId,
      leave.leaveType,
      original.start,
      original.end,
      {
        cancelType,
        proposedStart,
        proposedEnd,
        notes: values.notes.trim(),
      },
      days.workingDays,
      role,
    );
    if (!approval.ok || approval.approvalId == null) {
      updateLeaveRecord(leaveId, { taskStatus: 'Approved', cancelType: 'none' });
      return { ok: false, errorCode: approval.error ?? 'rsc_approval_failed' };
    }
    updateLeaveRecord(leaveId, { approvalRequestId: approval.approvalId });
    return { ok: true, leaveId, approvalId: approval.approvalId };
  },
};
