export type EmploymentStatus = 'Active' | 'OnLeave' | 'Terminated';

export type HrPersona = 'hr' | 'ceo' | 'unit_manager';

export interface EmployeeFilters {
  query: string;
  status: EmploymentStatus | 'any';
  hireFrom: string;
  hireTo: string;
}

export interface EmployeeListRow {
  employeeId: string;
  personId: string;
  fullName: string;
  title: string;
  departmentId: string;
  departmentName: string;
  primaryEmail: string;
  primaryPhone: string;
  hireDate: string;
  employmentStatus: EmploymentStatus;
  userNo: string | null;
}

export type HrListScope =
  | { mode: 'all' }
  | { mode: 'department'; departmentId: string };
