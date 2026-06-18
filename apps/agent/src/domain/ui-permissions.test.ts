import { describe, expect, it } from 'vitest';
import { mapAgentUiPermissions } from './ui-permissions';
import { getAgentPermissions } from './permissions';
import type { AgentAuthorizedProfile } from './agent-session';

const fullProfile: AgentAuthorizedProfile = {
  userId: 'u1',
  agentId: 1,
  displayName: 'Agent',
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

describe('mapAgentUiPermissions', () => {
  it('grants transact forms when canTransact is true', () => {
    const ui = mapAgentUiPermissions(getAgentPermissions(fullProfile));
    expect(ui.form.withdrawalSubmit.create).toBe(true);
    expect(ui.form.transferSubmit.create).toBe(true);
    expect(ui.form.transactionApprove(true).update).toBe(true);
  });

  it('denies transact forms when canTransact is false', () => {
    const ui = mapAgentUiPermissions(getAgentPermissions(readOnlyProfile));
    expect(ui.form.withdrawalSubmit.create).toBe(false);
    expect(ui.form.transferSubmit.create).toBe(false);
    expect(ui.form.transactionApprove(true).update).toBe(false);
    expect(ui.flags.canApproveTransaction).toBe(false);
  });

  it('scopes customer registration by mode', () => {
    const ui = mapAgentUiPermissions(getAgentPermissions(readOnlyProfile));
    expect(ui.form.customerRegister('new').create).toBe(false);
    expect(ui.form.customerRegister('edit').update).toBe(false);
  });
});
