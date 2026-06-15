import { describe, expect, it } from 'vitest';
import {
  hasFirstApproverPool,
  hasSecondApproverPool,
  isApprovalCountStaffed,
} from './approver-availability';

describe('approver-availability', () => {
  it('has first pool via compliance role', () => {
    expect(hasFirstApproverPool()).toBe(true);
  });

  it('has second pool when management role has active user', () => {
    expect(hasSecondApproverPool()).toBe(true);
  });

  it('count 2 is staffed with 12.3 matrix', () => {
    expect(isApprovalCountStaffed(2)).toBe(true);
    expect(isApprovalCountStaffed(1)).toBe(true);
    expect(isApprovalCountStaffed(0)).toBe(true);
  });
});
