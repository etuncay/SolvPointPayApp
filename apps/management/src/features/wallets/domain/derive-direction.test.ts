import { describe, expect, it } from 'vitest';
import { deriveDirection } from './derive-direction';

describe('deriveDirection', () => {
  it('movement direction öncelikli', () => {
    expect(deriveDirection('Inflow', 100, 50)).toBe('Inflow');
  });

  it('postBalance artışı → Inflow', () => {
    expect(deriveDirection(null, 1000, 1500)).toBe('Inflow');
  });

  it('postBalance azalışı → Outflow', () => {
    expect(deriveDirection(undefined, 2000, 1200)).toBe('Outflow');
  });
});
