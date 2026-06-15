import { describe, expect, it, beforeEach } from 'vitest';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import { resetAppUsersStore } from '@/mocks/app-users';
import { resetUsersAuditLog, usersService } from './mock-users-adapter';

describe('usersService', () => {
  beforeEach(() => {
    resetAppUsersStore();
    resetUsersAuditLog();
  });

  it('lists users for management only', () => {
    const rows = usersService.list('management', { query: '', roleId: 'any', status: 'any' });
    expect(rows.length).toBeGreaterThanOrEqual(7);
    expect(usersService.list('ops', { query: '', roleId: 'any', status: 'any' })).toHaveLength(0);
  });

  it('updateRole writes audit and single role', () => {
    const result = usersService.updateRole('management', MOCK_USER_IDS.management, 'usr-005', {
      roleId: 'role-fin',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user.roleId).toBe('role-fin');
      expect(result.user.roleName).toBe('Finans');
    }
    const audit = usersService.getAuditLog('usr-005');
    expect(audit.some((e) => e.field === 'roleId')).toBe(true);
  });

  it('rejects passive role assignment', () => {
    const result = usersService.updateRole('management', MOCK_USER_IDS.management, 'usr-005', {
      roleId: 'role-legacy',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errorCode).toBe('usr_passive_role_not_assignable');
  });
});
