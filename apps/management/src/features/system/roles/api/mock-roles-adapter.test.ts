import { describe, expect, it, beforeEach } from 'vitest';
import { resetRolesStore } from '@/mocks/roles-store';
import { resetRolesAuditLog, rolesService } from './mock-roles-adapter';

describe('rolesService', () => {
  beforeEach(() => {
    resetRolesStore();
    resetRolesAuditLog();
  });

  it('creates role with empty matrix', () => {
    const result = rolesService.create('management', {
      name: 'Test Rol',
      description: 'Açıklama',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const detail = rolesService.getById('management', result.role.id);
      expect(detail?.screenPermissions.length).toBeGreaterThan(0);
      expect(detail?.screenPermissions.every((p) => !p.canList)).toBe(true);
    }
  });

  it('appends audit on permission change', () => {
    const detail = rolesService.getById('management', 'role-comp');
    expect(detail).toBeTruthy();
    const row = detail!.screenPermissions.find((p) => p.screenKey === 'approvals.pool')!;
    const updated = { ...row, canFirstApprove: !row.canFirstApprove };
    const result = rolesService.update('management', 'role-comp', {
      screenPermissions: detail!.screenPermissions.map((p) =>
        p.screenId === row.screenId ? updated : p,
      ),
    });
    expect(result.ok).toBe(true);
    const audit = rolesService.getAuditLog('role-comp');
    expect(audit.some((e) => e.field.includes('canFirstApprove'))).toBe(true);
  });

  it('rejects duplicate role name on create', () => {
    const result = rolesService.create('management', { name: 'Operasyon', description: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errorCode).toBe('rol_name_duplicate');
  });
});
