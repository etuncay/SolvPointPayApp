import type {
  AgentTransactionApprovalOtpPort,
  TransactionApprovalOtpError,
  TransactionApprovalOtpVerifyResult,
} from '../contracts/agent-transaction-approval-otp-port';

function mapHttpError(status: number, body: { error?: string }): TransactionApprovalOtpError {
  if (status === 404) return 'not_found';
  if (body.error === 'expired') return 'expired';
  return 'invalid_otp';
}

/** Production — POST /agent/transactions/:id/verify-otp */
export function createHttpAgentTransactionApprovalOtpAdapter(
  apiBaseUrl: string,
): AgentTransactionApprovalOtpPort {
  const base = apiBaseUrl.replace(/\/$/, '');

  return {
    async verifyOtp({ transactionId, otp }): Promise<TransactionApprovalOtpVerifyResult> {
      const res = await fetch(`${base}/agent/transactions/${transactionId}/verify-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ otp }),
      });

      if (res.ok) {
        const data = (await res.json()) as { verificationId?: string };
        if (!data.verificationId?.trim()) {
          return { ok: false, error: 'invalid_otp' };
        }
        return { ok: true, verificationId: data.verificationId };
      }

      let body: { error?: string } = {};
      try {
        body = (await res.json()) as { error?: string };
      } catch {
        /* ignore */
      }
      return { ok: false, error: mapHttpError(res.status, body) };
    },
  };
}
