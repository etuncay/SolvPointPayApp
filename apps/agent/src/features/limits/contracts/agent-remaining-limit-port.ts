/** §7.2 / GenelIsleyis — kalan limit servisi (production sunucu doğrulaması). */
export type AgentLimitChannel = 'Agent' | 'Wallet';

export type AgentRemainingLimitRequest = {
  asOf: string;
  operationType: string;
  channel: AgentLimitChannel;
  currency: string;
  customerId: string;
  agentId?: string;
  agentAuthorizedPersonId?: string;
  walletId?: string;
  corporateAuthorizedPersonId?: string;
};

/** 0 = kapalı, -1 = limitsiz */
export type AgentLimitValue = number;

export type AgentRemainingLimitResult = {
  asOf: string;
  operationType: string;
  channel: AgentLimitChannel;
  currency: string;
  nextTxMaxAmount: AgentLimitValue;
  todayRemaining: AgentLimitValue;
  monthRemaining: AgentLimitValue;
  singleTxLimit: AgentLimitValue;
};

export type AgentRemainingLimitError = 'unauthorized' | 'invalid_request' | 'unavailable';

export type AgentRemainingLimitResponse =
  | { ok: true; data: AgentRemainingLimitResult }
  | { ok: false; error: AgentRemainingLimitError };

export interface AgentRemainingLimitPort {
  getRemainingLimit(input: AgentRemainingLimitRequest): Promise<AgentRemainingLimitResponse>;
}
