import { describe, expect, it } from 'vitest';
import { DEMO_APPROVAL_OTP, isValidDemoApprovalOtp } from './demo-approval-otp';

describe('demo-approval-otp', () => {
  it('accepts recommended demo code 123456', () => {
    expect(isValidDemoApprovalOtp(DEMO_APPROVAL_OTP)).toBe(true);
  });

  it('accepts any 6-digit code', () => {
    expect(isValidDemoApprovalOtp('000000')).toBe(true);
    expect(isValidDemoApprovalOtp('987654')).toBe(true);
  });

  it('rejects invalid lengths', () => {
    expect(isValidDemoApprovalOtp('12345')).toBe(false);
    expect(isValidDemoApprovalOtp('1234567')).toBe(false);
    expect(isValidDemoApprovalOtp('')).toBe(false);
    expect(isValidDemoApprovalOtp('12ab56')).toBe(false);
  });
});
