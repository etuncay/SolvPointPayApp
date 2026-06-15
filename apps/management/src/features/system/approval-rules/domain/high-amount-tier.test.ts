import { describe, expect, it } from 'vitest';
import { tierApprovalCount } from './high-amount-tier';

describe('tierApprovalCount', () => {
  it('applies tier bands and caps by maxCount', () => {
    expect(tierApprovalCount(500, 1000, 5000, 2)).toBe(0);
    expect(tierApprovalCount(3000, 1000, 5000, 2)).toBe(1);
    expect(tierApprovalCount(9000, 1000, 5000, 2)).toBe(2);
    expect(tierApprovalCount(9000, 1000, 5000, 1)).toBe(1);
  });
});
