import { describe, expect, it } from 'vitest';
import { assertAuthorizedPersonAge, isAtLeast18 } from './age-guard';

describe('age-guard', () => {
  it('rejects under 18', () => {
    expect(isAtLeast18('2010-01-01', new Date('2026-05-24'))).toBe(false);
    expect(assertAuthorizedPersonAge('2010-01-01')).toBe('ap2_under_18');
  });

  it('accepts 18+', () => {
    expect(isAtLeast18('1991-04-18', new Date('2026-05-24'))).toBe(true);
    expect(assertAuthorizedPersonAge('1991-04-18')).toBeNull();
  });
});
