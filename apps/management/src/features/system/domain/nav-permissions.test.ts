import { describe, expect, it } from 'vitest';
import {
  SYSTEM_CHILD_IDS,
  canSeeSystemMenu,
  filterSystemMenuItem,
  getSystemMenuDefaultHref,
  getSystemViewMode,
  getVisibleSystemChildIds,
  resolveSystemActiveSub,
} from './nav-permissions';
import type { NavItem } from '@epay/ui';

const systemMenuItem: NavItem = {
  id: 'system',
  icon: 'settings',
  label: 'm_system',
  href: '/system/users',
  kids: SYSTEM_CHILD_IDS.map((id, i) => ({
    id,
    no: String(i + 1),
    label: id,
    href: `/system/${id}`,
  })),
};

describe('system nav-permissions', () => {
  it('management sees all 7 children in order', () => {
    expect(getVisibleSystemChildIds('management')).toEqual([...SYSTEM_CHILD_IDS]);
    expect(canSeeSystemMenu('management')).toBe(true);
    expect(getSystemMenuDefaultHref('management')).toBe('/system/users');
    expect(getSystemViewMode('management')).toBe('full');
  });

  it('ops, finance, compliance hide system menu', () => {
    for (const role of ['ops', 'finance', 'compliance'] as const) {
      expect(canSeeSystemMenu(role)).toBe(false);
      expect(getVisibleSystemChildIds(role)).toEqual([]);
      expect(getSystemMenuDefaultHref(role)).toBeNull();
      expect(getSystemViewMode(role)).toBe('none');
    }
  });

  it('filterSystemMenuItem hides parent for non-management', () => {
    expect(filterSystemMenuItem(systemMenuItem, 'ops')).toBeNull();
    const filtered = filterSystemMenuItem(systemMenuItem, 'management');
    expect(filtered?.kids).toHaveLength(7);
    expect(filtered?.soon).toBeUndefined();
    expect(filtered?.href).toBe('/system/users');
    expect(filtered?.kids?.every((k) => k.soon === undefined)).toBe(true);
  });

  it('resolveSystemActiveSub maps path prefixes', () => {
    expect(resolveSystemActiveSub('/system')).toBe('sys_users');
    expect(resolveSystemActiveSub('/system/users')).toBe('sys_users');
    expect(resolveSystemActiveSub('/system/users/u-1')).toBe('sys_users');
    expect(resolveSystemActiveSub('/system/integrations/int-001')).toBe('sys_integrations');
    expect(resolveSystemActiveSub('/customers')).toBeNull();
  });
});
