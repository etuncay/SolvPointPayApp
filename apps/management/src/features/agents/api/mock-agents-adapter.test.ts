import { describe, expect, it, beforeEach } from 'vitest';
import { getAgentPermissions } from '../domain/permissions';
import { mockAgentsAdapter, resetAgentsStore } from './mock-agents-adapter';
import { AGENTS } from '@/mocks/agents';

describe('mockAgentsAdapter', () => {
  beforeEach(() => {
    resetAgentsStore();
  });

  it('record_status=0 kayıtları listelemez', () => {
    const hidden = AGENTS.filter((a) => a.recordStatus === 0);
    expect(hidden.length).toBeGreaterThan(0);

    const result = mockAgentsAdapter.list({
      status: 'all',
      query: '',
      advanced: { group: 'any', settlement: 'any', balance: 'any', from: '', to: '' },
    });
    for (const h of hidden) {
      expect(result.rows.some((r) => r.id === h.id)).toBe(false);
    }
    expect(result.stats.visibleTotal).toBe(AGENTS.length - hidden.length);
  });

  it('status ve query filtrelerini uygular', () => {
    const active = mockAgentsAdapter.list({
      status: 'active',
      query: '',
      advanced: { group: 'any', settlement: 'any', balance: 'any', from: '', to: '' },
    });
    expect(active.rows.every((r) => r.status === 'active')).toBe(true);

    const sample = active.rows[0];
    expect(sample).toBeDefined();
    const byQuery = mockAgentsAdapter.list({
      status: 'all',
      query: String(sample!.id),
      advanced: { group: 'any', settlement: 'any', balance: 'any', from: '', to: '' },
    });
    expect(byQuery.rows.some((r) => r.id === sample!.id)).toBe(true);
  });

  it('exportRows filtrelenmiş satırları döner', () => {
    const filters = {
      status: 'blocked' as const,
      query: '',
      advanced: { group: 'any', settlement: 'any', balance: 'any', from: '', to: '' },
    };
    const listed = mockAgentsAdapter.list(filters).rows;
    const exported = mockAgentsAdapter.exportRows(filters);
    expect(exported).toEqual(listed);
  });

  it('id aralığı 99901+ kullanır', () => {
    const result = mockAgentsAdapter.list({
      status: 'all',
      query: '',
      advanced: { group: 'any', settlement: 'any', balance: 'any', from: '', to: '' },
    });
    expect(result.rows.every((r) => r.id >= 99901)).toBe(true);
  });
});

describe('getAgentPermissions', () => {
  it('compliance export görür, insert yapmaz; finance export yapmaz', () => {
    expect(getAgentPermissions('compliance').export).toBe(true);
    expect(getAgentPermissions('compliance').insert).toBe(false);
    expect(getAgentPermissions('finance').export).toBe(false);
    expect(getAgentPermissions('ops').insert).toBe(true);
  });
});
