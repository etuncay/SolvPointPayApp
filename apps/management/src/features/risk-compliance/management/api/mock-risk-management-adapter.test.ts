import { describe, expect, it, beforeEach } from 'vitest';
import {
  mockRiskManagementAdapter,
  __resetRiskManagementStoreForTest,
  __isFraudChecksDisabledFlag,
} from './mock-risk-management-adapter';

describe('mockRiskManagementAdapter', () => {
  beforeEach(() => {
    __resetRiskManagementStoreForTest();
  });

  it('reference versioning — removed value gets effectiveTo', () => {
    const before = mockRiskManagementAdapter.getReferenceLists('compliance');
    const active = before.items.filter((i) => i.listCode === 'RiskyCountries' && !i.effectiveTo);
    const kept = active.filter((i) => i.value !== 'IR');
    const r = mockRiskManagementAdapter.saveReferenceLists(
      {
        items: [
          ...before.items.filter((i) => i.effectiveTo || i.listCode !== 'RiskyCountries'),
          ...kept,
        ],
        occupationThresholds: before.occupationThresholds,
      },
      'compliance',
    );
    expect(r.ok).toBe(true);
    const after = mockRiskManagementAdapter.getReferenceLists('compliance');
    expect(after.items.some((i) => i.value === 'IR' && i.effectiveTo)).toBe(true);
  });

  it('group overlap fail', () => {
    const { groups } = mockRiskManagementAdapter.getGroups('compliance');
    const bad = groups.map((g) =>
      g.id === 'GRP_MANAGERS' ? { ...g, memberIds: [...g.memberIds, 'u.comp'] } : g,
    );
    const r = mockRiskManagementAdapter.saveGroups({ groups: bad }, 'compliance');
    expect(r.error).toBe('rm_group_overlap');
  });

  it('timeout=0 — fraud_checks_disabled flag', () => {
    const r = mockRiskManagementAdapter.saveParams({ fraud_engine_timeout_ms: '0' }, 'management');
    expect(r.ok).toBe(true);
    expect(__isFraudChecksDisabledFlag()).toBe(true);
    expect(mockRiskManagementAdapter.getEngineTimeout()).toBe(0);
  });

  it('auto-distribute resolves member', () => {
    const target = mockRiskManagementAdapter.resolveRoutingTarget(
      { amount: 60_000, channel: 'Mobile', priority: 'High' },
      'compliance',
    );
    expect(target?.userId).toBeTruthy();
    expect(target?.autoDistributed).toBe(true);
  });
});
