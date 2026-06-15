import { describe, expect, it } from 'vitest';
import { computeWorkingDays } from './compute-working-days';

describe('computeWorkingDays', () => {
  it('counts Mon–Fri in a week without holidays', () => {
    expect(computeWorkingDays('2026-03-09', '2026-03-13', [])).toBe(5);
  });

  it('skips weekends', () => {
    expect(computeWorkingDays('2026-03-07', '2026-03-15', [])).toBe(5);
  });

  it('excludes public holidays', () => {
    expect(computeWorkingDays('2026-04-20', '2026-04-24', ['2026-04-23'])).toBe(4);
  });

  it('returns 0 when start after end', () => {
    expect(computeWorkingDays('2026-06-10', '2026-06-01', [])).toBe(0);
  });
});
