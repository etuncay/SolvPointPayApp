import { describe, expect, it, beforeEach } from 'vitest';
import { resetAgentsStore } from '@/features/agents/api/mock-agents-adapter';
import {
  mockAgentGroupsAdapter,
  resetAgentGroupsStore,
} from './mock-agent-groups-adapter';

describe('mockAgentGroupsAdapter', () => {
  beforeEach(() => {
    resetAgentGroupsStore();
    resetAgentsStore();
  });

  it('create duplicate code → fail', () => {
    const result = mockAgentGroupsAdapter.create({
      groupCode: 'STANDARD',
      name: 'Kopya',
      description: '',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('agg_code_duplicate');
  });

  it('update groupCode değişmez', () => {
    const row = mockAgentGroupsAdapter.list({ query: 'GOLD', status: 'any' })[0];
    expect(row).toBeDefined();

    const updated = mockAgentGroupsAdapter.update(row!.id, {
      name: 'Altın Güncellendi',
      description: 'test',
    });
    expect(updated.ok).toBe(true);

    const after = mockAgentGroupsAdapter
      .list({ query: 'GOLD', status: 'any' })
      .find((g) => g.id === row!.id);
    expect(after?.groupCode).toBe('GOLD');
    expect(after?.name).toBe('Altın Güncellendi');
  });

  it('deactivate default → agg_default_protected', () => {
    const standard = mockAgentGroupsAdapter.list({ query: 'STANDARD', status: 'any' })[0];
    expect(standard?.isDefault).toBe(true);

    const result = mockAgentGroupsAdapter.deactivate(standard!.id);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('agg_default_protected');
  });

  it('deactivate with active agents → agg_has_active_agents', () => {
    const groups = mockAgentGroupsAdapter.list({ status: 'Active', query: '' });
    const withAgents = groups.find((g) => mockAgentGroupsAdapter.countActiveAgents(g.groupCode) > 0);
    expect(withAgents).toBeDefined();

    const result = mockAgentGroupsAdapter.deactivate(withAgents!.id);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('agg_has_active_agents');
  });

  it('deactivate empty eligible group → Passive', () => {
    const created = mockAgentGroupsAdapter.create({
      groupCode: 'EMPTY_TEST',
      name: 'Boş Test',
      description: '',
    });
    expect(created.ok).toBe(true);

    const result = mockAgentGroupsAdapter.deactivate(created.id!);
    expect(result.ok).toBe(true);

    const row = mockAgentGroupsAdapter.list({ query: 'EMPTY_TEST', status: 'any' })[0];
    expect(row?.status).toBe('Passive');
  });

  it('list joins latest metric; null avg → formatter dash', () => {
    const silver = mockAgentGroupsAdapter.list({ query: 'SILVER', status: 'any' })[0];
    expect(silver?.avgFeePerTx).toBeNull();
    expect(silver?.avgTxCountPerAgent).toBe(22);

    const fmt = (v: number | null) => (v == null ? '—' : String(v));
    expect(fmt(silver!.avgFeePerTx)).toBe('—');
  });
});
