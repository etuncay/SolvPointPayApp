import { describe, expect, it } from 'vitest';
import { fxQuoteSecondsLeft, isFxQuoteExpired } from './fx-quote';

describe('fx-quote', () => {
  const now = 1_000_000;

  it('computes seconds left', () => {
    expect(fxQuoteSecondsLeft(now + 90_000, now)).toBe(90);
    expect(fxQuoteSecondsLeft(now + 500, now)).toBe(1);
    expect(fxQuoteSecondsLeft(now - 1, now)).toBe(0);
  });

  it('detects expiry', () => {
    expect(isFxQuoteExpired(null, now)).toBe(false);
    expect(isFxQuoteExpired(now + 1, now)).toBe(false);
    expect(isFxQuoteExpired(now, now)).toBe(true);
    expect(isFxQuoteExpired(now - 1, now)).toBe(true);
  });
});
