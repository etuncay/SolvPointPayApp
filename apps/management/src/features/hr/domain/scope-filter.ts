import type { EmployeeListRow, HrListScope } from './types';

export function applyEmployeeScope(rows: EmployeeListRow[], scope: HrListScope): EmployeeListRow[] {
  if (scope.mode === 'all') return rows;
  if (scope.mode === 'department') {
    return rows.filter((r) => r.departmentId === scope.departmentId);
  }
  return rows;
}
