import { describe, expect, it } from 'vitest';
import { computeMonthlyAvgVolumeTry } from './monthly-tx-volume';

describe('monthly-tx-volume', () => {
  it('returns non-negative average for known customer', () => {
    const avg = computeMonthlyAvgVolumeTry('99901', 'customer');
    expect(avg).toBeGreaterThanOrEqual(0);
  });

  it('returns 0 for invalid entity', () => {
    expect(computeMonthlyAvgVolumeTry('', 'customer')).toBe(0);
  });
});
