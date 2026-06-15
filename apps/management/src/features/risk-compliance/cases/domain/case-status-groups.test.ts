import { describe, expect, it } from 'vitest';
import { CLOSED_CASE_STATUSES, isOpenCase, OPEN_CASE_STATUSES } from './case-status-groups';

describe('case-status-groups', () => {
  it('open vs closed', () => {
    expect(isOpenCase('Unassigned')).toBe(true);
    expect(isOpenCase('Resolved_ConfirmedFraud')).toBe(false);
    expect(OPEN_CASE_STATUSES.length).toBeGreaterThan(0);
    expect(CLOSED_CASE_STATUSES).toContain('Rejected');
  });
});
