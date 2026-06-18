import { describe, expect, it } from 'vitest';
import type { AgentAuthorizedProfile } from './agent-session';
import {
  AGENT_ROUTE_PERMISSIONS,
  canAccessAgentPath,
  canAccessAgentRoute,
  getAgentRouteForbiddenCopy,
  resolveAgentRoutePermission,
} from './route-permissions-map';

const fullProfile: AgentAuthorizedProfile = {
  userId: 'u1',
  agentId: 1,
  displayName: 'Agent One',
  isAdmin: true,
  canTransact: true,
  canRegisterCustomers: true,
};

const readOnlyProfile: AgentAuthorizedProfile = {
  ...fullProfile,
  isAdmin: false,
  canTransact: false,
  canRegisterCustomers: false,
};

describe('AGENT_ROUTE_PERMISSIONS map', () => {
  it('has unique permission keys', () => {
    const keys = AGENT_ROUTE_PERMISSIONS.map((d) => d.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('canAccessAgentRoute', () => {
  it('read-only profile cannot transact or register customers', () => {
    expect(canAccessAgentRoute('withdrawal.access', readOnlyProfile)).toBe(false);
    expect(canAccessAgentRoute('transfers.access', readOnlyProfile)).toBe(false);
    expect(canAccessAgentRoute('transactions.approve', readOnlyProfile)).toBe(false);
    expect(canAccessAgentRoute('customers.create', readOnlyProfile)).toBe(false);
  });

  it('full profile can access transact routes', () => {
    expect(canAccessAgentRoute('withdrawal.access', fullProfile)).toBe(true);
    expect(canAccessAgentRoute('transfers.access', fullProfile)).toBe(true);
    expect(canAccessAgentRoute('transactions.approve', fullProfile)).toBe(true);
    expect(canAccessAgentRoute('customers.create', fullProfile)).toBe(true);
  });
});

describe('getAgentRouteForbiddenCopy', () => {
  it('transact routes use ag_forbidden_transact', () => {
    expect(getAgentRouteForbiddenCopy('withdrawal.access')).toMatchObject({
      subtitleKey: 'ag_forbidden_transact',
      backTo: '/',
    });
  });

  it('approve routes use ag_forbidden_approve', () => {
    expect(getAgentRouteForbiddenCopy('transactions.approve')).toMatchObject({
      subtitleKey: 'ag_forbidden_approve',
      backTo: '/transactions',
    });
  });

  it('unknown custom uses default copy', () => {
    expect(getAgentRouteForbiddenCopy('accounts.view')).toMatchObject({
      subtitleKey: 'ag_forbidden_default',
      backTo: '/',
    });
  });
});

describe('resolveAgentRoutePermission', () => {
  it('resolves static and dynamic paths', () => {
    expect(resolveAgentRoutePermission('/withdrawal')).toBe('withdrawal.access');
    expect(resolveAgentRoutePermission('/transfers/person')).toBe('transfers.access');
    expect(resolveAgentRoutePermission('/transactions')).toBe('transactions.list');
    expect(resolveAgentRoutePermission('/transactions/tx-1')).toBe('transactions.view');
    expect(resolveAgentRoutePermission('/transactions/tx-1/approve')).toBe('transactions.approve');
    expect(resolveAgentRoutePermission('/customers/new')).toBe('customers.create');
    expect(resolveAgentRoutePermission('/customers/cust-1')).toBe('customers.edit');
  });

  it('returns null for unguarded routes', () => {
    expect(resolveAgentRoutePermission('/')).toBeNull();
    expect(resolveAgentRoutePermission('/accounts')).toBe('accounts.view');
  });
});

describe('canAccessAgentPath', () => {
  it('delegates to permission checker', () => {
    expect(canAccessAgentPath('/withdrawal', readOnlyProfile)).toBe(false);
    expect(canAccessAgentPath('/withdrawal', fullProfile)).toBe(true);
    expect(canAccessAgentPath('/', fullProfile)).toBe(true);
  });
});
