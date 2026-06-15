import { describe, expect, it, beforeEach } from 'vitest';
import { resetAgentsStore, getAgentsStoreSnapshot } from '@/features/agents/api/mock-agents-adapter';
import {
  getActiveAssignmentForTest,
  getAssignmentStoreSnapshot,
  mockAgentGroupsAdapter,
  resetAgentGroupsStore,
} from './mock-agent-groups-adapter';

describe('mockAgentGroupAssignments', () => {
  beforeEach(() => {
    resetAgentGroupsStore();
    resetAgentsStore();
  });

  it('assign → ikinci grup: ilk atama Passive, yeni Active', () => {
    const agentId = 99901;
    const before = getActiveAssignmentForTest(agentId);
    expect(before?.groupCode).toBeTruthy();

    const targetGroup = before!.groupCode === 'GOLD' ? 'SILVER' : 'GOLD';
    const result = mockAgentGroupsAdapter.assignAgentToGroup(targetGroup, agentId);
    expect(result.ok).toBe(true);

    const active = getActiveAssignmentForTest(agentId);
    expect(active?.groupCode).toBe(targetGroup);

    const oldPassive = getAssignmentStoreSnapshot().find(
      (a) => a.id === before!.id,
    );
    expect(oldPassive?.status).toBe('Passive');
  });

  it('aynı agent için tek Active atama', () => {
    const agentId = 99902;
    mockAgentGroupsAdapter.assignAgentToGroup('PLATINUM', agentId);
    mockAgentGroupsAdapter.assignAgentToGroup('GOLD', agentId);

    const actives = getAssignmentStoreSnapshot().filter(
      (a) => a.agentId === agentId && a.status === 'Active',
    );
    expect(actives).toHaveLength(1);
  });

  it('remove son aktif → varsayılan gruba yeni Active', () => {
    const agentId = 99904;
    const active = getActiveAssignmentForTest(agentId);
    expect(active).toBeTruthy();

    const result = mockAgentGroupsAdapter.removeAgentFromGroup(active!.id);
    expect(result.ok).toBe(true);

    const after = getActiveAssignmentForTest(agentId);
    expect(after?.groupCode).toBe('STANDARD');

    const agent = getAgentsStoreSnapshot().find((a) => a.id === agentId);
    expect(agent?.group.key).toBe('standard');
  });

  it('assign pasif gruba → aga_passive_group', () => {
    const result = mockAgentGroupsAdapter.assignAgentToGroup('LEGACY_TIER', 99905);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('aga_passive_group');
  });

  it('list default filter → yalnızca Active', () => {
    const rows = mockAgentGroupsAdapter.listGroupAssignments('GOLD');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.status === 'Active')).toBe(true);
  });

  it('filter Passive → tarihsel kayıtlar görünür', () => {
    const rows = mockAgentGroupsAdapter.listGroupAssignments('GOLD', {
      query: '',
      status: 'Passive',
    });
    expect(rows.some((r) => r.agentId === 99901)).toBe(true);
  });

  it('countActiveAgents assignment store ile uyumlu', () => {
    const code = 'STANDARD';
    const fromService = mockAgentGroupsAdapter.countActiveAgents(code);
    const fromStore = getAssignmentStoreSnapshot().filter(
      (a) => a.groupCode === code && a.status === 'Active',
    ).length;
    expect(fromService).toBe(fromStore);
  });
});
