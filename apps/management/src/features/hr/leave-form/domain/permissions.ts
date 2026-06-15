import type { HrCurrentUserExtras } from '@/domain/hr-persona';
import type { EmployeeLeave } from '@/features/hr/leaves/domain/types';
import type { LeaveFormMode } from './types';

export function resolveLeaveFormMode(
  leave: EmployeeLeave | null,
  viewOnly: boolean,
  employeeId: string | null,
): LeaveFormMode | null {
  if (!leave) return 'create';
  if (!employeeId || leave.employeeId !== employeeId) return null;
  if (viewOnly || leave.taskStatus === 'Pending' || leave.taskStatus === 'Rejected') {
    return 'view';
  }
  if (leave.taskStatus === 'Approved') return 'cancel';
  return null;
}

export function canAccessLeaveForm(extras: HrCurrentUserExtras, mode: LeaveFormMode | null): boolean {
  if (mode == null) return false;
  if (mode === 'create') return extras.employeeId != null;
  return extras.employeeId != null;
}

export function canSubmitLeaveForm(mode: LeaveFormMode): boolean {
  return mode === 'create' || mode === 'cancel';
}
