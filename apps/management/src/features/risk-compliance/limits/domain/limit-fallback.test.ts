import { describe, expect, it } from 'vitest';
import { resolveEffectiveLimit } from './limit-fallback';
import { RISK_LIMIT_VERSION_V2 } from '@/mocks/risk-based-limits';

describe('resolveEffectiveLimit', () => {
  const rows = RISK_LIMIT_VERSION_V2.rows;

  it('uses Critical row when defined', () => {
    const resolved = resolveEffectiveLimit(rows, 'IndividualCustomer', 'Critical');
    expect(resolved.sourceRiskLevel).toBe('Critical');
    expect(resolved.singleTxLimit).toBe(10_000);
    expect(resolved.isFallbackDefault).toBe(false);
  });

  it('falls back Critical → High when Critical missing', () => {
    const withoutCritical = rows.filter(
      (r) => !(r.entityType === 'CorporateCustomer' && r.riskLevel === 'Critical'),
    );
    const resolved = resolveEffectiveLimit(withoutCritical, 'CorporateCustomer', 'Critical');
    expect(resolved.sourceRiskLevel).toBe('High');
  });

  it('returns unlimited defaults when no rows', () => {
    const resolved = resolveEffectiveLimit([], 'Agent', 'Low');
    expect(resolved.isFallbackDefault).toBe(true);
    expect(resolved.singleTxLimit).toBe(-1);
    expect(resolved.internationalTransfer).toBe('Allowed');
  });
});
