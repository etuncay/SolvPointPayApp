import { mockAgentTransactionsAdapter, type AgentTransactionsService } from './mock-agent-transactions-adapter';

/** Gerçek API bağlandığında burada adapter değiştirilir. */
export const agentTransactionsService: AgentTransactionsService = mockAgentTransactionsAdapter;
