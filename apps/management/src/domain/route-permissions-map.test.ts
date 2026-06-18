import { describe, expect, it } from 'vitest';
import {
  ROUTE_PERMISSIONS,
  canAccessPath,
  canAccessRoute,
  getRouteForbiddenCopy,
  resolveRoutePermission,
} from './route-permissions-map';

describe('ROUTE_PERMISSIONS map', () => {
  it('has unique permission keys', () => {
    const keys = ROUTE_PERMISSIONS.map((d) => d.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('covers all guarded routes in routes.tsx', () => {
    expect(ROUTE_PERMISSIONS.length).toBe(24);
  });
});

describe('canAccessRoute', () => {
  it('finance cannot access manual correction but can access integrated banks', () => {
    expect(canAccessRoute('transfers.manual', 'finance')).toBe(false);
    expect(canAccessRoute('banks.integrated', 'finance')).toBe(true);
    expect(canAccessRoute('banks.movements', 'finance')).toBe(true);
  });

  it('ops can access transfers and wallets', () => {
    expect(canAccessRoute('wallets.list', 'ops')).toBe(true);
    expect(canAccessRoute('transfers.list', 'ops')).toBe(true);
    expect(canAccessRoute('approvals.list', 'ops')).toBe(true);
    expect(canAccessRoute('agents.fees', 'ops')).toBe(true);
  });

  it('alltest has wallet access', () => {
    expect(canAccessRoute('wallets.list', 'alltest')).toBe(true);
  });
});

describe('getRouteForbiddenCopy', () => {
  it('approvals routes use ap_no_access', () => {
    expect(getRouteForbiddenCopy('approvals.list')).toMatchObject({
      subtitleKey: 'ap_no_access',
      backTo: '/',
    });
    expect(getRouteForbiddenCopy('approvals.detail')).toMatchObject({
      subtitleKey: 'ap_no_access',
    });
  });

  it('manual correction routes back to transfers', () => {
    expect(getRouteForbiddenCopy('transfers.manual')).toEqual({
      subtitleKey: 'cr_forbidden_sub',
      backTo: '/transfers',
      backLabelKey: 'cr_back_transfers',
    });
  });

  it('unknown permission uses generic copy', () => {
    expect(getRouteForbiddenCopy('wallets.list')).toMatchObject({
      subtitleKey: 'rm_forbidden',
      backTo: '/',
    });
  });
});

describe('resolveRoutePermission', () => {
  it('resolves static and dynamic paths', () => {
    expect(resolveRoutePermission('/approvals')).toBe('approvals.list');
    expect(resolveRoutePermission('/approvals/42')).toBe('approvals.detail');
    expect(resolveRoutePermission('/transfers/manual')).toBe('transfers.manual');
    expect(resolveRoutePermission('/transfers/9001')).toBe('transfers.detail');
    expect(resolveRoutePermission('/wallets/12/activities')).toBe('wallets.activities');
    expect(resolveRoutePermission('/wallets/12')).toBe('wallets.detail');
  });

  it('prefers more specific paths', () => {
    expect(resolveRoutePermission('/agents/new')).toBe('agents.form.new');
    expect(resolveRoutePermission('/agents/fees')).toBe('agents.fees');
    expect(resolveRoutePermission('/agents/groups/grp-1/agents')).toBe('agents.groups.assignments');
  });

  it('returns null for unguarded routes', () => {
    expect(resolveRoutePermission('/')).toBeNull();
    expect(resolveRoutePermission('/system/users')).toBeNull();
    expect(resolveRoutePermission('/playground')).toBeNull();
  });
});

describe('canAccessPath', () => {
  it('delegates to permission checker', () => {
    expect(canAccessPath('/transfers/manual', 'finance')).toBe(false);
    expect(canAccessPath('/transfers/manual', 'ops')).toBe(true);
    expect(canAccessPath('/system/users', 'finance')).toBe(true);
  });
});
