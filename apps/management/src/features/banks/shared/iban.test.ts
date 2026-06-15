import { describe, expect, it } from 'vitest';
import { isValidIban, normalizeIban } from './iban';

describe('iban', () => {
  it('normalize strips spaces and uppercases', () => {
    expect(normalizeIban('tr33 0006 1005 1978 6457 8413 26')).toBe('TR330006100519786457841326');
  });

  it('valid TR IBAN passes MOD-97', () => {
    expect(isValidIban('TR330006100519786457841326')).toBe(true);
    expect(isValidIban('TR33 0006 1005 1978 6457 8413 26')).toBe(true);
  });

  it('checksum failure returns false', () => {
    expect(isValidIban('TR330006100519786457841327')).toBe(false);
    expect(isValidIban('TR000000000000000000000000')).toBe(false);
  });

  it('invalid length or country format', () => {
    expect(isValidIban('TR123')).toBe(false);
    expect(isValidIban('XX330006100519786457841326')).toBe(false);
  });
});
