import { describe, expect, it } from 'vitest';
import { getEffectiveRate } from '@/lib/fx';
import { getFxRateToTry, toAmountTry } from './try-conversion';

describe('try-conversion', () => {
  it('TRY is 1:1', () => {
    expect(getFxRateToTry('TRY')).toBe(1);
    expect(toAmountTry(100, 'TRY')).toBe(100);
  });

  it('EUR uses effective rate', () => {
    expect(toAmountTry(100, 'EUR')).toBe(Math.round(100 * getEffectiveRate('EUR') * 100) / 100);
  });
});
