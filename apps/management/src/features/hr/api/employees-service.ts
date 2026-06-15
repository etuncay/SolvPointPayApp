import type { EmployeeFilters, EmployeeListRow, HrListScope } from '../domain/types';

export interface EmployeesService {
  list(scope: HrListScope, filters: EmployeeFilters): EmployeeListRow[];
  getListRow(employeeId: string, scope: HrListScope): EmployeeListRow | null;
  getAccessLog(): { at: string; scope: string; rowCount: number }[];
  resetAccessLog(): void;
}
