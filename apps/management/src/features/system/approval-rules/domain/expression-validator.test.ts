import { describe, expect, it } from 'vitest';
import { validateFieldRuleExpression } from './expression-validator';

describe('validateFieldRuleExpression', () => {
  it('accepts known field and valid condition', () => {
    const r = validateFieldRuleExpression({
      screenId: 'customers.fees',
      fieldName: 'amount',
      specialCondition: "currencyCode == 'TRY'",
    });
    expect(r.ok).toBe(true);
  });

  it('rejects unknown field', () => {
    const r = validateFieldRuleExpression({
      screenId: 'customers.fees',
      fieldName: 'unknownProp',
    });
    expect(r.ok).toBe(false);
    expect(r.errors).toContain('ar_validate_unknown_field');
  });
});
