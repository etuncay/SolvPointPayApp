import { describe, expect, it } from 'vitest';
import { hasSensitiveData, validateAmount, validateFreeText } from './validators';

describe('validators', () => {
  it('blocks TCKN-like patterns', () => {
    expect(hasSensitiveData('12345678901')).toBe(true);
    expect(validateFreeText('12345678901')).not.toBeNull();
  });

  it('validates amount against balance and limit', () => {
    expect(validateAmount(100, 50, 1000)).toMatch(/bakiye/i);
    expect(validateAmount(0, 100, 1000)).toMatch(/sıfır/i);
    expect(validateAmount(50, 100, 40)).toMatch(/limit/i);
    expect(validateAmount(50, 100, 1000)).toBeNull();
  });
});
