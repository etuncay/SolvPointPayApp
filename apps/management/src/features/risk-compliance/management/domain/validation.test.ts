import { describe, expect, it } from 'vitest';
import { validateEngineTimeout, validateOccupationThreshold, validateReferenceValue } from './validation';

describe('validation', () => {
  it('empty reference value fail', () => {
    expect(validateReferenceValue('  ')).toEqual({ ok: false, error: 'rm_ref_value_empty' });
  });

  it('negative threshold fail', () => {
    expect(
      validateOccupationThreshold({
        occupationId: 'O1',
        occupationLabel: 'X',
        maxMonthlyIncome: -1,
        maxSingleTxAmount: 0,
        maxMonthlyTxAmount: 0,
      }),
    ).toEqual({ ok: false, error: 'rm_threshold_negative' });
  });

  it('timeout parse', () => {
    expect(validateEngineTimeout('-1')).toEqual({ ok: true, parsed: -1 });
    expect(validateEngineTimeout('0')).toEqual({ ok: true, parsed: 0 });
    expect(validateEngineTimeout('-2').ok).toBe(false);
  });
});
