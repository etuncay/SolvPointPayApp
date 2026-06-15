import type { BackOfficeRole } from '@epay/ui';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { getEmployeeLeavesStore } from '@/mocks/employee-leaves';
import { getEmployeesListStore } from '@/mocks/employees';
import { applyLeaveScope } from '../domain/leave-scope-filter';
import { computeLeaveSummary } from '../domain/compute-leave-summary';
import { getHrLeaveParams } from '../domain/hr-leave-params';
import type {
  EmployeeLeaveListRow,
  LeaveFilters,
  LeaveListScope,
} from '../domain/types';
import type { EmployeeLeavesService, LeaveListAccessLogEntry } from './employee-leaves-service';

let accessLog: LeaveListAccessLogEntry[] = [];

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return { firstName: fullName, lastName: '' };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(' ') };
}

function joinRows(): EmployeeLeaveListRow[] {
  const employees = getEmployeesListStore();
  const byId = new Map(employees.map((e) => [e.employeeId, e]));
  return getEmployeeLeavesStore().flatMap((leave) => {
    const emp = byId.get(leave.employeeId);
    if (!emp) return [];
    const { firstName, lastName } = splitName(emp.fullName);
    return [
      {
        ...leave,
        firstName,
        lastName,
        departmentId: emp.departmentId,
        departmentName: emp.departmentName,
        title: emp.title,
      },
    ];
  });
}

function overlapsDateRange(row: EmployeeLeaveListRow, from: string, to: string): boolean {
  if (!from && !to) return true;
  if (from && row.endDate < from) return false;
  if (to && row.startDate > to) return false;
  return true;
}

function matchesFilters(row: EmployeeLeaveListRow, filters: LeaveFilters): boolean {
  const q = filters.query.trim().toLowerCase();
  if (q) {
    const hay = `${row.firstName} ${row.lastName} ${row.title} ${row.notes ?? ''}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (filters.leaveType !== 'any' && row.leaveType !== filters.leaveType) return false;
  if (filters.taskStatus !== 'any' && row.taskStatus !== filters.taskStatus) return false;
  if (filters.departmentId && row.departmentId !== filters.departmentId) return false;
  if (!overlapsDateRange(row, filters.dateFrom, filters.dateTo)) return false;
  return true;
}

function scopeKey(scope: LeaveListScope): string {
  if (scope.mode === 'all') return 'all';
  if (scope.mode === 'department') return `dept:${scope.departmentId}`;
  return `self:${scope.employeeId}`;
}

export function logLeaveListAccess(userId: string, scope: LeaveListScope, count: number): void {
  accessLog = [
    ...accessLog,
    { at: new Date().toISOString(), userId, scope: scopeKey(scope), count },
  ];
}

export function countLeaveRows(scope: LeaveListScope, filters: LeaveFilters): number {
  return applyLeaveScope(joinRows(), scope).filter((r) => matchesFilters(r, filters)).length;
}

export function createEmployeeLeavesService(role: BackOfficeRole): EmployeeLeavesService {
  return {
    list(scope, filters) {
      const user = getCurrentUser(role);
      const scoped = applyLeaveScope(joinRows(), scope).filter((r) => matchesFilters(r, filters));
      scoped.sort((a, b) => b.startDate.localeCompare(a.startDate));
      const params = getHrLeaveParams();
      const capped = scoped.slice(0, params.leaveReportMaxRows);
      logLeaveListAccess(user.id, scope, capped.length);
      return capped;
    },

    getSummary(employeeId, year) {
      const leaves = getEmployeeLeavesStore().filter((l) => l.recordStatus === 1);
      return computeLeaveSummary(leaves, employeeId, year, getHrLeaveParams());
    },

    getAccessLog() {
      return [...accessLog];
    },

    resetAccessLog() {
      accessLog = [];
    },
  };
}

/** Test ve basit importlar */
export const employeeLeavesService = createEmployeeLeavesService('ops');

export { appendLeaveRecord, updateLeaveRecord } from '@/mocks/employee-leaves';
