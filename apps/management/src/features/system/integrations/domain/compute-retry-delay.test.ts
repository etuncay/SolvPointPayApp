import { describe, expect, it } from 'vitest';
import { computeRetryDelayMs } from './compute-retry-delay';

describe('computeRetryDelayMs', () => {
  it('fixed delay', () => {
    expect(computeRetryDelayMs('FixedDelay', 2, 1000)).toBe(1000);
  });

  it('exponential backoff', () => {
    expect(computeRetryDelayMs('ExponentialBackoff', 1, 1000)).toBe(1000);
    expect(computeRetryDelayMs('ExponentialBackoff', 3, 1000)).toBe(4000);
    expect(computeRetryDelayMs('ExponentialBackoff', 5, 1000)).toBe(16_000);
  });
});
