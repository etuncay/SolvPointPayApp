import { describe, expect, it } from 'vitest';
import { createMockAgentTransactionApprovalOtpAdapter } from './mock-agent-transaction-approval-otp.adapter';
import { DEMO_APPROVAL_OTP } from '../domain/demo-approval-otp';

describe('mock-agent-transaction-approval-otp.adapter', () => {
  it('returns verificationId for valid demo OTP on pending transaction', async () => {
    const adapter = createMockAgentTransactionApprovalOtpAdapter();
    const result = await adapter.verifyOtp({ transactionId: 90001, otp: DEMO_APPROVAL_OTP });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.verificationId).toMatch(/^mock-otp-90001-/);
  });

  it('rejects invalid OTP format', async () => {
    const adapter = createMockAgentTransactionApprovalOtpAdapter();
    const result = await adapter.verifyOtp({ transactionId: 90001, otp: 'abc' });
    expect(result).toEqual({ ok: false, error: 'invalid_otp' });
  });

  it('returns not_found for unknown transaction', async () => {
    const adapter = createMockAgentTransactionApprovalOtpAdapter();
    const result = await adapter.verifyOtp({ transactionId: 99999, otp: DEMO_APPROVAL_OTP });
    expect(result).toEqual({ ok: false, error: 'not_found' });
  });
});
