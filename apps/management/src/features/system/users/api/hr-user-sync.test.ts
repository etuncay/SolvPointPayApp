import { describe, expect, it, beforeEach } from 'vitest';
import { getAppUserById, resetAppUsersStore } from '@/mocks/app-users';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import {
  markUserInactiveByEmployeeId,
  provisionUserFromEmployee,
  syncInactiveFromHr,
} from './hr-user-sync';

describe('hr-user-sync', () => {
  beforeEach(() => {
    resetAppUsersStore();
  });

  it('syncInactiveFromHr sets user Inactive', () => {
    const updated = syncInactiveFromHr('emp-001');
    expect(updated?.status).toBe('Inactive');
    expect(updated?.id).toBeDefined();
  });

  it('markUserInactiveByEmployeeId sets finance user inactive', () => {
    markUserInactiveByEmployeeId('emp-003');
    expect(getAppUserById(MOCK_USER_IDS.finance)?.status).toBe('Inactive');
  });

  it('provisionUserFromEmployee creates user without default role', () => {
    const user = provisionUserFromEmployee({
      id: 'emp-new-99',
      fullName: 'Yeni Personel',
      email: 'yeni@epay.demo',
      phone: '+90 555',
      status: 'Active',
    });
    expect(user.roleId).toBeNull();
    expect(user.status).toBe('Active');
    expect(user.hrEmployeeId).toBe('emp-new-99');
  });
});
