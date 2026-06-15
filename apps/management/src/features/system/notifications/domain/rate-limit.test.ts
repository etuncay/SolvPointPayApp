import { describe, expect, it, beforeEach } from 'vitest';
import { checkRateLimit, recordSend, resetRateLimitState } from './rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    resetRateLimitState();
  });

  it('rejects 6th send to same address within hour', () => {
    const addr = 'test@epay.local';
    const base = Date.now();
    for (let i = 0; i < 5; i++) {
      recordSend(addr, base + i * 2000);
    }
    expect(checkRateLimit(addr, base + 10000)).toBe('nt_rate_limit_exceeded');
  });
});
