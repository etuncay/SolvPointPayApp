import type { DataDriver } from '@epay/data';
import { createHttpAgentTransactionApprovalOtpAdapter } from './http-agent-transaction-approval-otp.adapter';
import { createMockAgentTransactionApprovalOtpAdapter } from './mock-agent-transaction-approval-otp.adapter';
import { mockAgentTransactionsAdapter } from './mock-agent-transactions-adapter';
import {
  setTransactionApprovalOtpPort,
} from './transaction-approval-otp.service';
import type { AgentTransactionsPort } from '../contracts/agent-transactions-port';

export function configureAgentTransactionPorts(options: {
  driver?: DataDriver;
  apiBaseUrl?: string;
}): void {
  if (options.driver === 'http' && options.apiBaseUrl?.trim()) {
    setTransactionApprovalOtpPort(
      createHttpAgentTransactionApprovalOtpAdapter(options.apiBaseUrl.trim()),
    );
    return;
  }
  setTransactionApprovalOtpPort(createMockAgentTransactionApprovalOtpAdapter());
}

configureAgentTransactionPorts({ driver: 'dexie' });

/** Gerçek işlem API adapter'ı bağlandığında burada değiştirilir. */
export const agentTransactionsService: AgentTransactionsPort = mockAgentTransactionsAdapter;

export type { AgentTransactionsPort, AgentTransactionsService };
