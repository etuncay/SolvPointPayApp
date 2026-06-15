import { describe, expect, it } from 'vitest';
import { computeWeightedScore } from './compute-score';

describe('computeWeightedScore', () => {
  it('sums two triggered active rules', () => {
    const score = computeWeightedScore(
      [
        {
          status: 'Active',
          scoreContribution: 15,
          weight: 1,
          conditionDsl: 'amount > 1000',
        },
        {
          status: 'Active',
          scoreContribution: 10,
          weight: 1,
          conditionDsl: "country = 'TR'",
        },
      ],
      { amount: 5000, country: 'TR' },
      'Transaction',
    );
    expect(score).toBe(25);
  });

  it('ignores passive rules', () => {
    const score = computeWeightedScore(
      [
        {
          status: 'Passive',
          scoreContribution: 50,
          conditionDsl: 'amount > 0',
        },
      ],
      { amount: 100 },
      'Transaction',
    );
    expect(score).toBe(0);
  });
});
