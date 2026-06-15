import { describe, expect, it } from 'vitest';
import { maskAddress } from './mask-message';

describe('maskMessage', () => {
  it('masks email local part', () => {
    expect(maskAddress('Email', 'user@epay.local')).toMatch(/@epay\.local$/);
    expect(maskAddress('Email', 'user@epay.local')).toContain('***');
  });

  it('masks phone digits', () => {
    expect(maskAddress('SMS', '+905551234567')).toContain('***');
  });
});
