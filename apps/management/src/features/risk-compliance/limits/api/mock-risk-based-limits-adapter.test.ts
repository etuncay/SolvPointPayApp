import { beforeEach, describe, expect, it } from 'vitest';
import { mockRiskBasedLimitsAdapter } from './mock-risk-based-limits-adapter';
import { RISK_LIMIT_VERSION_V1, RISK_LIMIT_VERSION_V2 } from '@/mocks/risk-based-limits';

describe('mock-risk-based-limits-adapter', () => {
  beforeEach(() => {
    mockRiskBasedLimitsAdapter.resetForTests();
  });

  it('getCurrent returns v2 rows', () => {
    const cur = mockRiskBasedLimitsAdapter.getCurrent();
    expect(cur.versionId).toBe(RISK_LIMIT_VERSION_V2.versionId);
    expect(cur.rows.length).toBe(15);
  });

  it('getEffective past date returns v1', () => {
    const past = mockRiskBasedLimitsAdapter.getEffective('2025-06-01');
    expect(past.versionId).toBe(RISK_LIMIT_VERSION_V1.versionId);
    const high = past.rows.find(
      (r) => r.entityType === 'IndividualCustomer' && r.riskLevel === 'High',
    );
    expect(high?.singleTxLimit).toBe(60_000);
  });

  it('saveVersion closes previous and opens new', () => {
    const before = mockRiskBasedLimitsAdapter.getCurrent();
    const rows = before.rows.map((r) => ({ ...r }));
    const saved = mockRiskBasedLimitsAdapter.saveVersion(rows);
    expect(saved.versionId).not.toBe(before.versionId);
    const past = mockRiskBasedLimitsAdapter.getEffective(
      new Date(Date.now() - 86_400_000).toISOString(),
    );
    expect(past.versionId).toBe(before.versionId);
  });

  it('saveVersion rejects monotonic violation', () => {
    const cur = mockRiskBasedLimitsAdapter.getCurrent();
    const bad = cur.rows.map((r) => {
      if (r.entityType === 'Agent' && r.riskLevel === 'Critical') {
        return { ...r, singleTxLimit: 999_999, singleTxApprovalThreshold: 500_000 };
      }
      if (r.entityType === 'Agent' && r.riskLevel === 'High') {
        return { ...r, singleTxLimit: 1_000, singleTxApprovalThreshold: 800 };
      }
      return r;
    });
    expect(() => mockRiskBasedLimitsAdapter.saveVersion(bad)).toThrow('rl_monotonic');
  });
});
