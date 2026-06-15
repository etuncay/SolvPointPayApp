import { getDepartmentById } from '@/mocks/departments';
import type { EmploymentStatus } from '@/features/hr/domain/types';

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

function row(
  partial: Omit<EmployeeListRow, 'departmentName' | 'fullName'> & {
    firstName?: string;
    lastName?: string;
    fullName?: string;
  },
): EmployeeListRow {
  const fullName =
    partial.fullName ?? `${partial.firstName ?? ''} ${partial.lastName ?? ''}`.trim();
  return {
    employeeId: partial.employeeId,
    personId: partial.personId,
    fullName,
    title: partial.title,
    departmentId: partial.departmentId,
    departmentName: getDepartmentById(partial.departmentId)?.name ?? '—',
    primaryEmail: partial.primaryEmail,
    primaryPhone: partial.primaryPhone,
    hireDate: partial.hireDate,
    employmentStatus: partial.employmentStatus,
    userNo: partial.userNo,
  };
}

export const EMPLOYEES_LIST_SEED: EmployeeListRow[] = [
  row({
    employeeId: 'emp-001',
    personId: 'per-001',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    title: 'Operasyon Uzmanı',
    departmentId: 'dept-ops',
    primaryEmail: 'ahmet.yilmaz@epay.demo',
    primaryPhone: '+90 532 100 0001',
    hireDate: '2024-01-15',
    employmentStatus: 'Active',
    userNo: 'USR-00001',
  }),
  row({
    employeeId: 'emp-002',
    personId: 'per-002',
    firstName: 'Ayşe',
    lastName: 'Demir',
    title: 'Uyum Uzmanı',
    departmentId: 'dept-compliance',
    primaryEmail: 'ayse.demir@epay.demo',
    primaryPhone: '+90 532 100 0002',
    hireDate: '2024-02-20',
    employmentStatus: 'OnLeave',
    userNo: 'USR-00002',
  }),
  row({
    employeeId: 'emp-003',
    personId: 'per-003',
    firstName: 'Fatma',
    lastName: 'Kaya',
    title: 'Finans Müdürü',
    departmentId: 'dept-finance',
    primaryEmail: 'fatma.kaya@epay.demo',
    primaryPhone: '+90 532 100 0003',
    hireDate: '2024-03-10',
    employmentStatus: 'Terminated',
    userNo: 'USR-00003',
  }),
  row({
    employeeId: 'emp-004',
    personId: 'per-004',
    firstName: 'Mehmet',
    lastName: 'Şahin',
    title: 'Genel Müdür',
    departmentId: 'dept-mgmt',
    primaryEmail: 'mehmet.sahin@epay.demo',
    primaryPhone: '+90 532 100 0004',
    hireDate: '2023-11-01',
    employmentStatus: 'Active',
    userNo: 'USR-00004',
  }),
  row({
    employeeId: 'emp-005',
    personId: 'per-005',
    firstName: 'Zeynep',
    lastName: 'Arslan',
    title: 'İK Uzmanı',
    departmentId: 'dept-hr',
    primaryEmail: 'zeynep.arslan@epay.demo',
    primaryPhone: '+90 532 100 0005',
    hireDate: '2025-01-08',
    employmentStatus: 'Active',
    userNo: null,
  }),
  row({
    employeeId: 'emp-006',
    personId: 'per-006',
    firstName: 'Can',
    lastName: 'Öztürk',
    title: 'Operasyon Asistanı',
    departmentId: 'dept-ops',
    primaryEmail: 'can.ozturk@epay.demo',
    primaryPhone: '+90 532 100 0006',
    hireDate: '2025-03-01',
    employmentStatus: 'Active',
    userNo: 'USR-00006',
  }),
];

let listStore: EmployeeListRow[] = EMPLOYEES_LIST_SEED.map((r) => ({ ...r }));

export function getEmployeesListStore(): EmployeeListRow[] {
  return listStore.map((r) => ({ ...r }));
}

export function resetEmployeesListStore(): void {
  listStore = EMPLOYEES_LIST_SEED.map((r) => ({ ...r }));
}

export function upsertEmployeeListRow(row: EmployeeListRow): void {
  const idx = listStore.findIndex((r) => r.employeeId === row.employeeId);
  const next = { ...row, departmentName: getDepartmentById(row.departmentId)?.name ?? '—' };
  if (idx < 0) listStore = [...listStore, next];
  else listStore = [...listStore.slice(0, idx), next, ...listStore.slice(idx + 1)];
}

export function removeEmployeeListRow(employeeId: string): void {
  listStore = listStore.filter((r) => r.employeeId !== employeeId);
}
