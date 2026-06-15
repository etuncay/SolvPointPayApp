import type { EmployeeLeave, LeaveCancelType, LeaveType } from '@/features/hr/leaves/domain/types';

export type LeaveFormMode = 'create' | 'cancel' | 'view';

export interface LeaveFormValues {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  notes: string;
  cancelFull: boolean;
}

export interface LeaveDetail extends EmployeeLeave {
  employeeName: string;
  departmentName: string;
}

export type LeaveFormSubmitResult =
  | { ok: true; leaveId: string; approvalId: number }
  | { ok: false; errorCode: string };

export type LeaveCancelMeta = {
  cancelType: LeaveCancelType;
  proposedStart: string;
  proposedEnd: string;
  notes: string;
};
