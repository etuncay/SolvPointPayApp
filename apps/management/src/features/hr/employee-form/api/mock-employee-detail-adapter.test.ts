import { describe, expect, it, beforeEach } from 'vitest';
import { getAppUsersStore, resetAppUsersStore } from '@/mocks/app-users';
import { resetEmployeesListStore } from '@/mocks/employees';
import {
  employeeDetailService,
  resetEmployeeDetailStoreForTest,
} from './mock-employee-detail-adapter';
import { SAMPLE_EMPLOYEE_EMP001 } from '@/mocks/sample-employee';

const formValues = {
  ...SAMPLE_EMPLOYEE_EMP001,
  employeeId: undefined,
  personId: undefined,
  userNo: undefined,
  createdAt: undefined,
  updatedAt: undefined,
} as never;

function verifiedForm() {
  return {
    photoUrl: null,
    firstName: 'Yeni',
    lastName: 'Personel',
    identityNo: '98765432109',
    identityDocument: 'IdentityCard' as const,
    title: 'Stajyer',
    departmentId: 'dept-hr',
    hireDate: '2026-05-01',
    nationality: 'TUR',
    birthPlace: 'İzmir',
    birthDate: '1995-03-10',
    gender: 'Female' as const,
    maritalStatus: 'Single' as const,
    maidenName: null,
    documentSerialNo: null,
    documentIssueDate: null,
    documentIssuedBy: null,
    documentExpiryDate: null,
    motherName: null,
    fatherName: null,
    educationLevel: 'Bachelor' as const,
    lastSchool: null,
    graduationYear: null,
    taxCountry: 'TUR',
    bankName: null,
    bankAccountNo: null,
    iban: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    employmentStatus: 'Active' as const,
    addresses: SAMPLE_EMPLOYEE_EMP001.addresses,
    contacts: [
      { id: 1, type: 'email' as const, value: 'yeni@epay.demo', verified: true, primary: true },
      { id: 2, type: 'phone' as const, value: '+905559999999', verified: true, primary: true },
    ],
    documents: [],
  };
}

describe('mock-employee-detail-adapter', () => {
  beforeEach(() => {
    resetAppUsersStore();
    resetEmployeesListStore();
    resetEmployeeDetailStoreForTest();
  });

  it('creates employee with userNo after bridge', () => {
    const result = employeeDetailService.create(verifiedForm());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.detail.userNo).toMatch(/^USR-/);
      const user = getAppUsersStore().find((u) => u.hrEmployeeId === result.detail.employeeId);
      expect(user?.status).toBe('Active');
    }
  });

  it('syncs inactive on terminated update', () => {
    const created = employeeDetailService.create(verifiedForm());
    if (!created.ok) throw new Error('create failed');
    const updated = employeeDetailService.update(created.detail.employeeId, {
      ...verifiedForm(),
      employmentStatus: 'Terminated',
    });
    expect(updated.ok).toBe(true);
    const user = getAppUsersStore().find((u) => u.hrEmployeeId === created.detail.employeeId);
    expect(user?.status).toBe('Inactive');
  });
});
