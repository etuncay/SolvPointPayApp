import { describe, expect, it, beforeEach } from 'vitest';
import {
  __unsafeGetSecretForTest,
  allocateCredentialRef,
  getCredentialDisplay,
  resetCredentialVault,
} from '@/mocks/credential-vault';

describe('credential-vault', () => {
  beforeEach(() => {
    resetCredentialVault();
  });

  it('UI path never exposes secret', () => {
    const ref = allocateCredentialRef('int-001');
    expect(getCredentialDisplay()).toBe('***');
    expect(__unsafeGetSecretForTest(ref)).toBeTruthy();
  });
});
