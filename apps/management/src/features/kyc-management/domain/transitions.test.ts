import { describe, expect, it } from 'vitest';
import {
  applyFalsePositive,
  applyReject,
  applyRequestAdditional,
  applyVerifyFinalize,
  canApplyDecision,
} from './transitions';

describe('kyc transitions', () => {
  it('request additional blocks entity', () => {
    const r = applyRequestAdditional();
    expect(r.decision).toBe('RequestAdditional');
    expect(r.entityPatch.status).toBe('blocked');
    expect(r.entityPatch.blockReason).toBe('UnderInvestigation');
  });

  it('reject closes entity', () => {
    const r = applyReject();
    expect(r.entityPatch.status).toBe('closed');
    expect(r.entityPatch.closeReason).toBe('RejectedDueToKyc');
  });

  it('false positive activates', () => {
    expect(applyFalsePositive().entityPatch.status).toBe('active');
  });

  it('verify finalize activates with score', () => {
    const r = applyVerifyFinalize(42);
    expect(r.decision).toBe('Verified');
    expect(r.entityPatch.riskScore).toBe(42);
  });

  it('can apply when undecided or request additional', () => {
    expect(canApplyDecision(null)).toBe(true);
    expect(canApplyDecision('RequestAdditional')).toBe(true);
    expect(canApplyDecision('Verified')).toBe(false);
  });
});
