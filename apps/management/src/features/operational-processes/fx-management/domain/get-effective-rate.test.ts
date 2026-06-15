import { describe, expect, it } from 'vitest';
import { getEffectiveRate } from './get-effective-rate';

describe('getEffectiveRate', () => {
  it('TRY için 1 döner', () => {
    expect(getEffectiveRate('TRY')).toBe(1);
  });

  it('USD/EUR için marjlı satış kuru döner', () => {
    const usd = getEffectiveRate('USD', 'Inside');
    const eur = getEffectiveRate('EUR', 'Inside');
    expect(usd).toBeGreaterThan(30);
    expect(eur).toBeGreaterThan(30);
    expect(getEffectiveRate('USD', 'Outside')).not.toBe(usd);
  });
});
