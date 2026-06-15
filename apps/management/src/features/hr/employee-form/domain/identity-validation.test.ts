import { describe, expect, it } from 'vitest';
import { validateIdentityNo } from './identity-validation';

describe('validateIdentityNo', () => {
  it('accepts 11-digit TCKN for IdentityCard', () => {
    expect(validateIdentityNo('12345678901', 'IdentityCard')).toBeNull();
  });

  it('rejects short TCKN', () => {
    expect(validateIdentityNo('123', 'IdentityCard')).toBe('ef_tckn_invalid');
  });

  it('accepts passport length', () => {
    expect(validateIdentityNo('AB1234567', 'Passport')).toBeNull();
  });
});
