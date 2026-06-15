import { describe, expect, it } from 'vitest';
import { applyCaseAction } from './transitions';

describe('transitions', () => {
  const base = {
    caseStatus: 'Assigned' as const,
    ownerUserId: 'u1',
    departmentId: 'finance',
  };

  it('take assigns owner', () => {
    const r = applyCaseAction(
      { ...base, ownerUserId: null },
      { kind: 'take', performedBy: 'u2', performedByName: 'Test', note: '' },
    );
    expect(r.caseStatus).toBe('Assigned');
    expect(r.ownerUserId).toBe('u2');
  });

  it('resolve closes', () => {
    const r = applyCaseAction(base, {
      kind: 'resolve',
      performedBy: 'u1',
      performedByName: 'Test',
      note: 'OK',
      resolutionCode: 'Resolved_IssueFixed',
    });
    expect(r.caseStatus).toBe('Resolved_IssueFixed');
    expect(r.closedAt).not.toBeNull();
  });
});
