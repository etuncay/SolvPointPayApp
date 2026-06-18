import { describe, expect, it } from 'vitest';
import {
  firstFreeTextError,
  hasSensitiveData,
  SENSITIVE_DATA_I18N_KEY,
  AMOUNT_BALANCE_I18N_KEY,
  AMOUNT_LIMIT_I18N_KEY,
  AMOUNT_ZERO_I18N_KEY,
  validateAmount,
  validateFreeText,
} from './validators';

describe('validators', () => {
  it('blocks TCKN-like patterns', () => {
    expect(hasSensitiveData('12345678901')).toBe(true);
    expect(validateFreeText('12345678901')).toBe(SENSITIVE_DATA_I18N_KEY);
    expect(hasSensitiveData('Odeme12345678901ref')).toBe(true);
  });

  it('blocks card-like patterns', () => {
    expect(hasSensitiveData('4111111111111111')).toBe(true);
    expect(hasSensitiveData('4111-1111-1111-1111')).toBe(true);
    expect(validateFreeText('kart 4111-1111-1111-1111')).toBe(SENSITIVE_DATA_I18N_KEY);
  });

  it('allows normal free text', () => {
    expect(validateFreeText('Fatura ödemesi')).toBeNull();
    expect(validateFreeText('')).toBeNull();
    expect(hasSensitiveData('Ahmet Yılmaz')).toBe(false);
  });

  it('firstFreeTextError returns on first hit', () => {
    expect(firstFreeTextError('temiz', '12345678901', 'başka')).toBe(SENSITIVE_DATA_I18N_KEY);
    expect(firstFreeTextError('temiz', 'not')).toBeNull();
  });

  it('validates amount against balance and limit', () => {
    expect(validateAmount(100, 50, 1000)).toBe(AMOUNT_BALANCE_I18N_KEY);
    expect(validateAmount(0, 100, 1000)).toBe(AMOUNT_ZERO_I18N_KEY);
    expect(validateAmount(50, 100, 40)).toBe(AMOUNT_LIMIT_I18N_KEY);
    expect(validateAmount(50, 100, 1000)).toBeNull();
  });
});
