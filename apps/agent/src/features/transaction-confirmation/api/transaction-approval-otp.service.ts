import { createMockAgentTransactionApprovalOtpAdapter } from './mock-agent-transaction-approval-otp.adapter';
import type { AgentTransactionApprovalOtpPort } from '../contracts/agent-transaction-approval-otp-port';

let port: AgentTransactionApprovalOtpPort | null = null;

export function setTransactionApprovalOtpPort(next: AgentTransactionApprovalOtpPort): void {
  port = next;
}

export function getTransactionApprovalOtpPort(): AgentTransactionApprovalOtpPort | null {
  return port;
}

function resolvePort(): AgentTransactionApprovalOtpPort {
  if (!port) {
    port = createMockAgentTransactionApprovalOtpAdapter();
  }
  return port;
}

/** İşlem onayı OTP — UI/adapter bu yüzeyi kullanır; mock veya HTTP adapter takılır. */
export const transactionApprovalOtpApi: AgentTransactionApprovalOtpPort = {
  verifyOtp(input) {
    return resolvePort().verifyOtp(input);
  },
};
