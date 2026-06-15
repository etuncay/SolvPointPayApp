import { describe, expect, it } from 'vitest';
import { validateConditionDsl } from './parser';
import { FRAUD_ACTIONS_SCORE_DEF, hasActionConflict } from '../fraud-actions';

describe('validateConditionDsl', () => {
  it('rejects empty DSL', () => {
    const r = validateConditionDsl('', 'Customer');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors).toContain('rs_dsl_empty');
  });

  it('rejects unbalanced parens', () => {
    const r = validateConditionDsl("(amount > 1000 AND country = 'TR'", 'Transaction');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some((e) => e.includes('paren'))).toBe(true);
  });

  it('accepts valid transaction DSL', () => {
    const r = validateConditionDsl("amount > 1000 AND country = 'TR'", 'Transaction');
    expect(r.ok).toBe(true);
  });
});

describe('fraud-actions score def', () => {
  it('excludes AddRisk', () => {
    expect(FRAUD_ACTIONS_SCORE_DEF).not.toContain('AddRisk');
  });

  it('detects Allow+Block conflict', () => {
    expect(hasActionConflict(['Allow', 'Block'])).toBe(true);
    expect(hasActionConflict(['Allow', 'Hold'])).toBe(false);
  });
});
