import { describe, expect, it } from 'vitest';
import { validateParameterValue } from './validate-parameter-value';

describe('validateParameterValue', () => {
  it('accepts valid number', () => {
    expect(validateParameterValue('reconciliation.amount_tolerance_try', '0.05')).toBeNull();
  });

  it('rejects invalid number', () => {
    expect(validateParameterValue('reconciliation.amount_tolerance_try', 'abc')).toBe(
      'prm_invalid_value',
    );
  });

  it('accepts duration_ms -1', () => {
    expect(validateParameterValue('fraud.engine_timeout_ms', '-1')).toBeNull();
  });

  it('rejects non-integer duration', () => {
    expect(validateParameterValue('fraud.engine_timeout_ms', '1.5')).toBe('prm_invalid_value');
  });
});
