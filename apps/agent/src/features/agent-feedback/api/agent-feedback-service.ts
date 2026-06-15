import { mockAgentFeedbackAdapter, type AgentFeedbackService } from './mock-agent-feedback-adapter';

/** Gerçek API bağlandığında burada adapter değiştirilir. */
export const agentFeedbackService: AgentFeedbackService = mockAgentFeedbackAdapter;

export type { AgentFeedbackService };
