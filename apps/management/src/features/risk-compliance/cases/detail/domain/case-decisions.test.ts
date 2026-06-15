import { describe, expect, it } from 'vitest';
import { statusAfterApprove, statusAfterReject, statusAfterRoute } from './case-decisions';

describe('case-decisions', () => {
  it('approve → Resolved_NoIssue', () => {
    expect(statusAfterApprove()).toBe('Resolved_NoIssue');
  });

  it('reject → Rejected', () => {
    expect(statusAfterReject()).toBe('Rejected');
  });

  it('route → Assigned', () => {
    expect(statusAfterRoute()).toBe('Assigned');
  });
});
