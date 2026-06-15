import { describe, expect, it } from 'vitest';
import { validateRiskBasedLimits } from './limit-validation';
import type { RiskBasedLimitRow } from './types';
import { RISK_LIMIT_VERSION_V2 } from '@/mocks/risk-based-limits';

describe('limit-validation', () => {
  const base = RISK_LIMIT_VERSION_V2.rows;

  it('valid template passes', () => {
    expect(validateRiskBasedLimits(base).ok).toBe(true);
  });

  it('Low singleTx more permissive than global fails global cap', () => {
    const rows = base.map((r) =>
      r.entityType === 'IndividualCustomer' && r.riskLevel === 'Low'
        ? { ...r, singleTxLimit: -1 }
        : r,
    );
    const global = rows.find(
      (r) => r.entityType === 'IndividualCustomer' && r.riskLevel === null,
    )!;
    if (global.singleTxLimit !== -1) {
      const bad = rows.map((r) =>
        r.entityType === 'IndividualCustomer' && r.riskLevel === 'Low'
          ? { ...r, singleTxLimit: global.singleTxLimit + 1 }
          : r,
      );
      const capResult = validateRiskBasedLimits(bad);
      expect(capResult.ok).toBe(false);
      if (!capResult.ok) {
        expect(capResult.errors.some((e) => e.code === 'rl_global_cap')).toBe(true);
      }
    }
  });

  it('High more permissive than Low fails monotonic', () => {
    const rows: RiskBasedLimitRow[] = base.map((r) => {
      if (r.entityType !== 'CorporateCustomer') return r;
      if (r.riskLevel === 'High') return { ...r, singleTxLimit: 999_999 };
      if (r.riskLevel === 'Low') return { ...r, singleTxLimit: 10_000 };
      return r;
    });
    const result = validateRiskBasedLimits(rows);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.code === 'rl_monotonic')).toBe(true);
  });

  it('approval exceeds singleTx fails', () => {
    const rows = base.map((r) =>
      r.entityType === 'Agent' && r.riskLevel === 'Medium'
        ? { ...r, singleTxLimit: 20_000, singleTxApprovalThreshold: 50_000 }
        : r,
    );
    const result = validateRiskBasedLimits(rows);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.code === 'rl_approval_exceeds')).toBe(true);
  });

  it('monthly less than daily fails', () => {
    const rows = base.map((r) =>
      r.entityType === 'Agent' && r.riskLevel === 'Low'
        ? { ...r, dailyLimit: 100_000, monthlyLimit: 50_000 }
        : r,
    );
    const result = validateRiskBasedLimits(rows);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.code === 'rl_monthly_lt_daily')).toBe(true);
  });
});
