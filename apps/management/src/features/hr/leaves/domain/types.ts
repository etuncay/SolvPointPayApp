export type LeaveType =
  | 'AnnualLeave'
  | 'SickLeave'
  | 'UnpaidLeave'
  | 'ExcuseLeave'
  | 'MaternityLeave'
  | 'Other';
export type TaskStatus = 'Pending' | 'Approved' | 'Rejected' | 'Canceled';
export type LeaveCancelType = 'none' | 'partial' | 'full';

export interface EmployeeLeave {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  workingDays: number;
  notes: string | null;
  taskStatus: TaskStatus;
  recordStatus: 0 | 1;
  createdAt: string;
  createdBy: string;
  approvalRequestId: number | null;
  cancelType: LeaveCancelType;
  originalStartDate: string | null;
  originalEndDate: string | null;
}

export interface EmployeeLeaveListRow extends EmployeeLeave {
  firstName: string;
  lastName: string;
  departmentId: string;
  departmentName: string;
  title: string;
}

export interface LeaveSummary {
  year: number;
  usedAnnualLeaveDays: number;
  remainingAnnualLeaveDays: number;
  usedSickLeaveDays: number;
  entitlementDays: number;
}

export interface LeaveFilters {
  query: string;
  leaveType: LeaveType | 'any';
  taskStatus: TaskStatus | 'any';
  departmentId: string;
  dateFrom: string;
  dateTo: string;
}

export type LeaveListScope =
  | { mode: 'all' }
  | { mode: 'department'; departmentId: string }
  | { mode: 'self'; employeeId: string };
