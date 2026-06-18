import type {
  AgentRemainingLimitPort,
  AgentRemainingLimitRequest,
  AgentRemainingLimitResponse,
  AgentRemainingLimitResult,
} from '../contracts/agent-remaining-limit-port';

function toApiBody(input: AgentRemainingLimitRequest): Record<string, string | undefined> {
  return {
    as_of: input.asOf,
    operation_type: input.operationType,
    channel: input.channel,
    currency: input.currency,
    customer_id: input.customerId,
    agent_id: input.agentId,
    agent_authorized_person_id: input.agentAuthorizedPersonId,
    wallet_id: input.walletId,
    corporate_authorized_person_id: input.corporateAuthorizedPersonId,
  };
}

function fromApiBody(body: Record<string, unknown>): AgentRemainingLimitResult {
  return {
    asOf: String(body.as_of ?? body.asOf ?? ''),
    operationType: String(body.operation_type ?? body.operationType ?? ''),
    channel: (body.channel as 'Agent' | 'Wallet') ?? 'Agent',
    currency: String(body.currency ?? ''),
    nextTxMaxAmount: Number(body.next_tx_max_amount ?? body.nextTxMaxAmount ?? 0),
    todayRemaining: Number(body.today_remaining ?? body.todayRemaining ?? 0),
    monthRemaining: Number(body.month_remaining ?? body.monthRemaining ?? 0),
    singleTxLimit: Number(body.single_tx_limit ?? body.singleTxLimit ?? 0),
  };
}

/** Production — POST /agent/remaining-limit (§7.2 kalan limit servisi). */
export function createHttpAgentRemainingLimitAdapter(apiBaseUrl: string): AgentRemainingLimitPort {
  const base = apiBaseUrl.replace(/\/$/, '');

  return {
    async getRemainingLimit(input): Promise<AgentRemainingLimitResponse> {
      const res = await fetch(`${base}/agent/remaining-limit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(toApiBody(input)),
      });

      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: 'unauthorized' };
      }
      if (res.status === 400) {
        return { ok: false, error: 'invalid_request' };
      }
      if (!res.ok) {
        return { ok: false, error: 'unavailable' };
      }

      const body = (await res.json()) as Record<string, unknown>;
      return { ok: true, data: fromApiBody(body) };
    },
  };
}
