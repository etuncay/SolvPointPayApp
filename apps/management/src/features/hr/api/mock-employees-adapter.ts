import { getEmployeesListStore } from '@/mocks/employees';
import { applyEmployeeScope } from '../domain/scope-filter';
import type { EmployeeFilters, EmployeeListRow, HrListScope } from '../domain/types';
import type { EmployeesService } from './employees-service';

export type EmployeeListAccessLogEntry = {
  at: string;
  scope: string;
  rowCount: number;
};

let accessLog: EmployeeListAccessLogEntry[] = [];

function scopeKey(scope: HrListScope): string {
  if (scope.mode === 'all') return 'all';
  if (scope.mode === 'department') return `dept:${scope.departmentId}`;
  return 'self';
}

function logEmployeeListAccess(scope: HrListScope, count: number): void {
  accessLog = [...accessLog, { at: new Date().toISOString(), scope: scopeKey(scope), rowCount: count }];
}

function matchesQuery(row: EmployeeListRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    row.fullName.toLowerCase().includes(q) ||
    row.title.toLowerCase().includes(q) ||
    row.primaryEmail.toLowerCase().includes(q) ||
    row.primaryPhone.toLowerCase().includes(q)
  );
}

function matchesFilters(row: EmployeeListRow, filters: EmployeeFilters): boolean {
  if (filters.status !== 'any' && row.employmentStatus !== filters.status) return false;
  if (filters.hireFrom && row.hireDate < filters.hireFrom) return false;
  if (filters.hireTo && row.hireDate > filters.hireTo) return false;
  return matchesQuery(row, filters.query);
}

export const employeesService: EmployeesService = {
  list(scope, filters) {
    const rows = applyEmployeeScope(getEmployeesListStore(), scope)
      .filter((r) => matchesFilters(r, filters))
      .sort((a, b) => a.fullName.localeCompare(b.fullName, 'tr'));
    logEmployeeListAccess(scope, rows.length);
    return rows;
  },

  getListRow(employeeId, scope) {
    const row = getEmployeesListStore().find((r) => r.employeeId === employeeId);
    if (!row) return null;
    const scoped = applyEmployeeScope([row], scope);
    return scoped[0] ?? null;
  },

  getAccessLog() {
    return [...accessLog];
  },

  resetAccessLog() {
    accessLog = [];
  },
};
