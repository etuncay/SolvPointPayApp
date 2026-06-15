import type { HrCurrentUserExtras } from '@/domain/hr-persona';
import type { EmployeeLeaveListRow, LeaveListScope } from './types';

export function resolveLeaveListScope(extras: HrCurrentUserExtras): LeaveListScope | null {
  if (extras.hrPersona === 'hr' || extras.hrPersona === 'ceo') {
    return { mode: 'all' };
  }
  if (extras.hrPersona === 'unit_manager' && extras.departmentId) {
    return { mode: 'department', departmentId: extras.departmentId };
  }
  if (extras.employeeId) {
    return { mode: 'self', employeeId: extras.employeeId };
  }
  return null;
}

export function applyLeaveScope(
  rows: EmployeeLeaveListRow[],
  scope: LeaveListScope,
): EmployeeLeaveListRow[] {
  if (scope.mode === 'all') return rows;
  if (scope.mode === 'department') {
    return rows.filter((r) => r.departmentId === scope.departmentId);
  }
  return rows.filter((r) => r.employeeId === scope.employeeId);
}
