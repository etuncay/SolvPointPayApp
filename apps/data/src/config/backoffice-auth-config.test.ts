import { describe, expect, it } from 'vitest';
import { isBackOfficeRegisterEnabled } from './backoffice-auth-config';

describe('isBackOfficeRegisterEnabled', () => {
  it('disabled in production by default', () => {
    expect(isBackOfficeRegisterEnabled({ production: true })).toBe(false);
  });

  it('enabled in dev by default', () => {
    expect(isBackOfficeRegisterEnabled({ production: false })).toBe(true);
  });

  it('respects VITE_ALLOW_REGISTER override', () => {
    expect(isBackOfficeRegisterEnabled({ production: true, allowRegisterEnv: 'true' })).toBe(true);
    expect(isBackOfficeRegisterEnabled({ production: false, allowRegisterEnv: 'false' })).toBe(false);
  });
});
