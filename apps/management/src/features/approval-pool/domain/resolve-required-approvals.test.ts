import { describe, expect, it, beforeEach } from 'vitest';
import { resetScreenApprovalRulesStore } from '@/mocks/screen-approval-rules';
import { resolveRequiredApprovals } from './resolve-required-approvals';

describe('resolveRequiredApprovals', () => {
  beforeEach(() => {
    resetScreenApprovalRulesStore();
  });

  it('maps bridge key to registry and returns 1 or 2', () => {
    expect(resolveRequiredApprovals('customer_individual')).toBeGreaterThanOrEqual(1);
    expect(resolveRequiredApprovals('risk.admin')).toBe(2);
  });

  it('falls back to 1 for unknown keys', () => {
    expect(resolveRequiredApprovals('unknown_screen')).toBe(1);
  });
});
