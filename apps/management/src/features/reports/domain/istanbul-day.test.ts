import { describe, expect, it } from 'vitest';
import { isWithinIstanbulDay, istanbulDayBounds } from './istanbul-day';

describe('istanbul-day', () => {
  it('bounds span single calendar day', () => {
    const { start, end } = istanbulDayBounds('2026-05-24');
    expect(end.getTime() - start.getTime()).toBeGreaterThan(23 * 60 * 60 * 1000);
  });

  it('exactly 1 day old maps to 1_5 bucket boundary via in-day check', () => {
    expect(isWithinIstanbulDay('2026-05-24T10:00:00Z', '2026-05-24')).toBe(true);
    expect(isWithinIstanbulDay('2026-05-23T10:00:00Z', '2026-05-24')).toBe(false);
  });
});
