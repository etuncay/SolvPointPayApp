import { describe, expect, it } from 'vitest';
import type { AgentAuthorizedProfile } from './agent-session';
import { getAgentPermissions } from './permissions';

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

describe('getAgentPermissions', () => {
  it('grants transact modules when canTransact is true', () => {
    const p = getAgentPermissions(fullProfile);
    expect(p.withdrawal.access).toBe(true);
    expect(p.transfers.access).toBe(true);
    expect(p.transactions.approve).toBe(true);
    expect(p.customers.create).toBe(true);
    expect(p.settings.users).toBe(true);
  });

  it('denies transact and customer registration when canTransact is false', () => {
    const p = getAgentPermissions(readOnlyProfile);
    expect(p.withdrawal.access).toBe(false);
    expect(p.transfers.access).toBe(false);
    expect(p.transactions.approve).toBe(false);
    expect(p.customers.create).toBe(false);
    expect(p.customers.edit).toBe(false);
    expect(p.settings.users).toBe(false);
    expect(p.transactions.list).toBe(true);
    expect(p.transactions.view).toBe(true);
  });

  it('playground follows DEV flag', () => {
    const p = getAgentPermissions(fullProfile);
    expect(p.playground.access).toBe(import.meta.env.DEV);
  });
});
