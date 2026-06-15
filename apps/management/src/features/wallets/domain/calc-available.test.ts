import { describe, expect, it } from 'vitest';
import { calcAvailable } from './calc-available';

describe('calcAvailable', () => {
  it('blocked=-1 → available 0', () => {
    expect(calcAvailable(50_000, -1)).toBe(0);
  });

  it('kısmi bloke → max(0, balance - blocked)', () => {
    expect(calcAvailable(10_000, 3_000)).toBe(7_000);
  });

  it('bloke yok → balance', () => {
    expect(calcAvailable(5_000, 0)).toBe(5_000);
  });

  it('bloke > bakiye → 0', () => {
    expect(calcAvailable(1_000, 5_000)).toBe(0);
  });
});
