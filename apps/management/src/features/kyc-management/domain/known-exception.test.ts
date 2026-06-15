import { describe, expect, it } from 'vitest';
import { KYC_KNOWN_EXCEPTIONS_SEED } from '@/mocks/kyc-known-exceptions';
import { resolveKnownException } from './known-exception';

describe('known-exception', () => {
  it('matches identity key above threshold', () => {
    expect(
      resolveKnownException(
        { identityNo: '75683988090', queryResultLabel: 'Liste — Eşleşme %82' },
        KYC_KNOWN_EXCEPTIONS_SEED,
      ),
    ).toBe(true);
  });

  it('does not match below threshold', () => {
    expect(
      resolveKnownException(
        { identityNo: '75683988090', queryResultLabel: 'Liste — Eşleşme %50' },
        KYC_KNOWN_EXCEPTIONS_SEED,
      ),
    ).toBe(false);
  });
});
