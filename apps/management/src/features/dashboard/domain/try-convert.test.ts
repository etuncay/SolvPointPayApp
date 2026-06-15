import { describe, expect, it } from 'vitest';
import { toTry } from './try-convert';

describe('toTry', () => {
  it('TRY tutarı aynı kalır', () => {
    expect(toTry(100, 'TRY')).toBe(100);
  });

  it('USD için efektif kur uygular', () => {
    const result = toTry(10, 'USD');
    expect(result).toBeGreaterThan(300);
  });
});
