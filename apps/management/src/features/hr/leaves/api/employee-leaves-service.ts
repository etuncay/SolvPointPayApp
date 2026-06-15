import type {
  EmployeeLeave,
  EmployeeLeaveListRow,
  LeaveFilters,
  LeaveListScope,
  LeaveSummary,
} from '../domain/types';

export interface LeaveListAccessLogEntry {
  at: string;
  userId: string;
  scope: string;
  count: number;
}

export interface EmployeeLeavesService {
  list(scope: LeaveListScope, filters: LeaveFilters): EmployeeLeaveListRow[];
  getSummary(employeeId: string, year: number): LeaveSummary;
  getAccessLog(): LeaveListAccessLogEntry[];
  resetAccessLog(): void;
}

export type { EmployeeLeave };
