import { describe, expect, it } from 'vitest';
import { getEffectiveRate } from '@/lib/fx';
import { computeCorrectionFx, convertToTry } from './fx-convert';

describe('fx-convert', () => {
  it('TRY talep — aynı PB cüzdanlarda tutar eşit', () => {
    const fx = computeCorrectionFx(10_000, 'TRY', 'TRY', 'TRY');
    expect(fx.sourceOutAmount).toBe(10_000);
    expect(fx.targetInAmount).toBe(10_000);
  });

  it('USD talep → TRY kaynak çıkış', () => {
    const fx = computeCorrectionFx(100, 'USD', 'TRY', 'TRY');
    const expected = Math.round(100 * getEffectiveRate('USD') * 100) / 100;
    expect(fx.sourceOutAmount).toBe(expected);
    expect(fx.targetInAmount).toBe(expected);
  });

  it('farklı PB kaynak/hedef — önizleme farklı', () => {
    const fx = computeCorrectionFx(100, 'USD', 'TRY', 'EUR');
    expect(fx.sourceOutAmount).not.toBe(fx.targetInAmount);
    expect(convertToTry(fx.sourceOutAmount, 'TRY')).toBeCloseTo(convertToTry(100, 'USD'), 0);
  });
});
