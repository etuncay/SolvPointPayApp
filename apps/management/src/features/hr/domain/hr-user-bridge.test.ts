import { beforeEach, describe, expect, it } from 'vitest';
import { getAppUsersStore, resetAppUsersStore } from '@/mocks/app-users';
import { resetEmployeesListStore } from '@/mocks/employees';
import {
  getEmployeeForUserSync,
  provisionUserFromEmployeeId,
  syncUserInactiveFromEmployee,
} from './hr-user-bridge';
import type { EmployeeDetail } from '@/features/hr/employee-form/domain/types';

function minimalDetail(partial: Partial<EmployeeDetail>): EmployeeDetail {
  return {
    employeeId: 'emp-004',
    personId: 'per-004',
    userNo: null,
    photoUrl: null,
    firstName: 'Test',
    lastName: 'User',
    identityNo: '11111111111',
    identityDocument: 'IdentityCard',
    title: 'Test',
    departmentId: 'dept-mgmt',
    hireDate: '2024-01-01',
    nationality: 'TUR',
    birthPlace: 'İstanbul',
    birthDate: '1990-01-01',
    gender: 'Male',
    maritalStatus: 'Single',
    maidenName: null,
    documentSerialNo: null,
    documentIssueDate: null,
    documentIssuedBy: null,
    documentExpiryDate: null,
    motherName: null,
    fatherName: null,
    educationLevel: 'Bachelor',
    lastSchool: null,
    graduationYear: null,
    taxCountry: 'TUR',
    bankName: null,
    bankAccountNo: null,
    iban: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    employmentStatus: 'Active',
    addresses: [],
    contacts: [
      { id: 1, type: 'email', value: 'test@epay.demo', verified: true, primary: true },
      { id: 2, type: 'phone', value: '+90 532 000 0000', verified: false, primary: true },
    ],
    documents: [],
    createdAt: '',
    updatedAt: '',
    ...partial,
  };
}

describe('hr-user-bridge', () => {
  beforeEach(() => {
    resetAppUsersStore();
    resetEmployeesListStore();
  });

  it('getEmployeeForUserSync maps Terminated to Inactive status', () => {
    const payload = getEmployeeForUserSync(
      minimalDetail({ employeeId: 'emp-003', employmentStatus: 'Terminated' }),
    );
    expect(payload.status).toBe('Inactive');
  });

  it('provisionUserFromEmployeeId creates app user for emp-004', () => {
    const user = provisionUserFromEmployeeId(minimalDetail({ employeeId: 'emp-004' }));
    expect(user.hrEmployeeId).toBe('emp-004');
    expect(getAppUsersStore().some((u) => u.id === user.id)).toBe(true);
  });

  it('syncUserInactiveFromEmployee marks linked user Inactive', () => {
    syncUserInactiveFromEmployee('emp-003');
    const linked = getAppUsersStore().find((u) => u.hrEmployeeId === 'emp-003');
    expect(linked?.status).toBe('Inactive');
  });
});
