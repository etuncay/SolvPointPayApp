import { describe, expect, it } from 'vitest';
import type { AuthUser } from '@epay/data';
import { MENU_ITEMS } from '@/config/navigation';
import { filterMenuForRole } from '@/config/filter-menu';
import { BACK_OFFICE_ROLES } from './role-resolution';
import {
  isNavigationRoleSyncedWithSession,
  resolveNavigationRole,
  sanitizeAuthUser,
} from './navigation-role';

describe('navigation-role', () => {
  it('synced when effective role equals account role', () => {
    expect(
      isNavigationRoleSyncedWithSession({
        accountRole: 'finance',
        effectiveRole: 'finance',
        isDemoRoleOverride: false,
      }),
    ).toBe(true);
  });

  it('synced when demo override is intentional', () => {
    expect(
      isNavigationRoleSyncedWithSession({
        accountRole: 'ops',
        effectiveRole: 'compliance',
        isDemoRoleOverride: true,
      }),
    ).toBe(true);
  });

  it('out of sync without demo override flag', () => {
    expect(
      isNavigationRoleSyncedWithSession({
        accountRole: 'ops',
        effectiveRole: 'compliance',
        isDemoRoleOverride: false,
      }),
    ).toBe(false);
  });

  it('rejects invalid session role', () => {
    const bad = {
      id: 'x',
      fullName: 'X',
      email: 'x@y.z',
      phone: '1',
      role: 'hacker',
    } as AuthUser;
    expect(sanitizeAuthUser(bad)).toBeNull();
  });

  it('menu uses same ids for session role and resolved navigation role', () => {
    for (const role of BACK_OFFICE_ROLES) {
      const direct = filterMenuForRole(MENU_ITEMS, role).map((i) => i.id);
      const resolved = filterMenuForRole(
        MENU_ITEMS,
        resolveNavigationRole({ accountRole: role, effectiveRole: role }),
      ).map((i) => i.id);
      expect(resolved).toEqual(direct);
    }
  });

  it('finance sees banks but not risk parent in default menu', () => {
    const ids = filterMenuForRole(MENU_ITEMS, 'finance').map((i) => i.id);
    expect(ids).toContain('banks');
    expect(ids).not.toContain('risk');
  });

  it('compliance sees risk', () => {
    const ids = filterMenuForRole(MENU_ITEMS, 'compliance').map((i) => i.id);
    expect(ids).toContain('risk');
  });
});
