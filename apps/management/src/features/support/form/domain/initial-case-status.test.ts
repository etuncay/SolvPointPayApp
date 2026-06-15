import { describe, expect, it } from 'vitest';
import { initialCaseStatus } from './initial-case-status';

describe('initial-case-status', () => {
  it('Assigned when owner or department set', () => {
    expect(initialCaseStatus('user-1', null)).toBe('Assigned');
    expect(initialCaseStatus(null, 'finance')).toBe('Assigned');
  });

  it('Unassigned when both empty', () => {
    expect(initialCaseStatus(null, null)).toBe('Unassigned');
    expect(initialCaseStatus('', '')).toBe('Unassigned');
  });
});
