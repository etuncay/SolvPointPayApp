import { describe, expect, it } from 'vitest';
import {
  nextRoleInCycle,
  readDemoRoleFromUrl,
  readDeprecatedRoleFromUrl,
  resolveEffectiveRole,
} from './role-resolution';

describe('role-resolution', () => {
  it('reads demoRole query param only', () => {
    expect(readDemoRoleFromUrl('?demoRole=finance')).toBe('finance');
    expect(readDemoRoleFromUrl('?role=compliance')).toBeNull();
  });

  it('deprecated role param is detectable but not used as demoRole', () => {
    expect(readDeprecatedRoleFromUrl('?role=compliance')).toBe('compliance');
  });

  it('account role wins without demo override', () => {
    expect(
      resolveEffectiveRole({
        accountRole: 'ops',
        demoOverride: null,
        guestRole: 'finance',
      }),
    ).toBe('ops');
  });

  it('demo override applies when authed', () => {
    expect(
      resolveEffectiveRole({
        accountRole: 'ops',
        demoOverride: 'compliance',
        guestRole: 'finance',
      }),
    ).toBe('compliance');
  });

  it('guest uses guestRole when not authed', () => {
    expect(
      resolveEffectiveRole({
        accountRole: null,
        demoOverride: null,
        guestRole: 'finance',
      }),
    ).toBe('finance');
  });

  it('cycles roles in order', () => {
    expect(nextRoleInCycle('alltest')).toBe('ops');
    expect(nextRoleInCycle('ops')).toBe('finance');
  });
});
