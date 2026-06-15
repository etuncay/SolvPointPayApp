import { describe, expect, it } from 'vitest';
import { validateDateRange, validateRoleAssignment } from './validation';

describe('validateRoleAssignment', () => {
  it('rejects passive role for new assignment', () => {
    expect(validateRoleAssignment({ roleId: 'role-legacy' })).toBe(
      'usr_passive_role_not_assignable',
    );
  });

  it('allows active role', () => {
    expect(validateRoleAssignment({ roleId: 'role-ops' })).toBeNull();
  });

  it('rejects invalid date range', () => {
    expect(
      validateRoleAssignment({
        roleId: 'role-fin',
        validFrom: '2026-06-01',
        validTo: '2026-01-01',
      }),
    ).toBe('usr_invalid_dates');
  });
});

describe('validateDateRange', () => {
  it('passes when only one date set', () => {
    expect(validateDateRange('2026-01-01', null)).toBe(true);
  });
});
