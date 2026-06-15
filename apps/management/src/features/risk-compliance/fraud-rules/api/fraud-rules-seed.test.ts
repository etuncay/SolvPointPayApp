import { describe, expect, it } from 'vitest';
import { FRAUD_RULES } from '@/mocks/fraud-rules';
import { validateFraudConditionDsl } from '@/features/risk-compliance/shared/rule-dsl';

describe('FRAUD_RULES seed — tüm aktif kuralların DSL koşulu geçerli', () => {
  for (const r of FRAUD_RULES.filter((x) => x.recordStatus === 1)) {
    it(`${r.id} (${r.title}) koşulu doğrulanır`, () => {
      const result = validateFraudConditionDsl(r.conditionDsl, r.scope);
      expect(result.ok, JSON.stringify(result)).toBe(true);
    });
  }

  it('MASAK T-006 kuralları kataloğda mevcut', () => {
    const refs = FRAUD_RULES.map((r) => r.regulationReference);
    expect(refs).toContain('T-006-2.5');
    expect(refs).toContain('T-006-2.20');
    expect(refs).toContain('T-006-2.70');
  });
});
