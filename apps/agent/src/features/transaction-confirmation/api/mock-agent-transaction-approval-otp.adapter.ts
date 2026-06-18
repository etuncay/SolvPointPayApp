import { isValidDemoApprovalOtp } from '../domain/demo-approval-otp';
import type {
  AgentTransactionApprovalOtpPort,
  TransactionApprovalOtpVerifyResult,
} from '../contracts/agent-transaction-approval-otp-port';
import { agentTransactionsStore } from './agent-transactions-store';

export function createMockAgentTransactionApprovalOtpAdapter(): AgentTransactionApprovalOtpPort {
  return {
    async verifyOtp({ transactionId, otp }): Promise<TransactionApprovalOtpVerifyResult> {
      const tx = agentTransactionsStore.get(transactionId);
      if (!tx) return { ok: false, error: 'not_found' };
      if (!isValidDemoApprovalOtp(otp)) return { ok: false, error: 'invalid_otp' };
      return { ok: true, verificationId: `mock-otp-${transactionId}-${Date.now()}` };
    },
  };
}
