import { describe, expect, it } from 'vitest';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import type { AppUser } from '@/mocks/app-users';
import { isUserAccessEffective } from './role-access-status';

const base: AppUser = {
  id: MOCK_USER_IDS.ops,
  userNo: 'USR-00001',
  hrEmployeeId: 'emp-001',
  fullName: 'Test',
  email: 't@test.com',
  phone: '+90',
  roleId: 'role-ops',
  validFrom: null,
  validTo: null,
  status: 'Active',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('isUserAccessEffective', () => {
  it('returns false when validTo expired', () => {
    const user: AppUser = { ...base, validTo: '2026-01-01' };
    expect(isUserAccessEffective(user, new Date('2026-05-24'))).toBe(false);
  });

  it('returns false for passive role', () => {
    const user: AppUser = { ...base, roleId: 'role-legacy' };
    expect(isUserAccessEffective(user, new Date('2026-05-24'))).toBe(false);
  });

  it('returns false when inactive', () => {
    const user: AppUser = { ...base, status: 'Inactive' };
    expect(isUserAccessEffective(user, new Date('2026-05-24'))).toBe(false);
  });

  it('returns true for active role in range', () => {
    expect(isUserAccessEffective(base, new Date('2026-05-24'))).toBe(true);
  });
});
