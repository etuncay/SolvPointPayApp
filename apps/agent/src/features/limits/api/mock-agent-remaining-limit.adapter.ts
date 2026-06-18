import { CUSTOMERS } from '@/mocks/data';
import {
  AGENT_GLOBAL_DAILY_LIMIT,
  agentSettingsStore,
} from '@/features/settings/api/agent-settings-store';
import type {
  AgentRemainingLimitPort,
  AgentRemainingLimitRequest,
  AgentRemainingLimitResponse,
} from '../contracts/agent-remaining-limit-port';
import { computeRemainingLimit } from '../domain/compute-remaining-limit';
import type { ActorLimits, LimitActor } from '../domain/compute-remaining-limit';
import { sumAgentScopedUsage } from '../domain/mock-agent-usage';

function mockCustomerLimits(kyc: string, operationType: string): ActorLimits {
  const isIntl = operationType === 'InternationalTransfer';
  if (kyc === 'L2' || kyc === 'L3') {
    return {
      singleTxLimit: 1_000_000,
      dailyLimit: -1,
      monthlyLimit: -1,
      internationalTransfer: 'Allowed',
    };
  }
  if (kyc === 'L1') {
    return {
      singleTxLimit: -1,
      dailyLimit: -1,
      monthlyLimit: 185_000,
      internationalTransfer: isIntl ? 'Allowed' : 'Allowed',
    };
  }
  return {
    singleTxLimit: 10_000,
    dailyLimit: 10_000,
    monthlyLimit: 10_000,
    internationalTransfer: isIntl ? 'Forbidden' : 'Allowed',
  };
}

function resolveAuthorizedUser(agentAuthorizedPersonId?: string) {
  const users = agentSettingsStore.listUsers();
  const id = Number(agentAuthorizedPersonId);
  return users.find((u) => u.id === id) ?? users.find((u) => u.active) ?? users[0] ?? null;
}

function buildMockActors(input: AgentRemainingLimitRequest): LimitActor[] {
  const asOf = new Date(input.asOf);
  const customer = CUSTOMERS.find((c) => String(c.id) === input.customerId);
  const usage = input.agentId
    ? sumAgentScopedUsage(input.agentId, asOf, input.currency)
    : { dailyUsed: 0, monthlyUsed: 0 };

  const actors: LimitActor[] = [];

  if (customer) {
    actors.push({
      key: 'customer',
      limits: mockCustomerLimits(String(customer.kyc), input.operationType),
      usage: { dailyUsed: 0, monthlyUsed: 0 },
    });
  }

  if (input.agentId) {
    actors.push({
      key: 'agent',
      limits: {
        singleTxLimit: -1,
        dailyLimit: AGENT_GLOBAL_DAILY_LIMIT,
        monthlyLimit: -1,
        internationalTransfer: 'Allowed',
      },
      usage,
    });
  }

  const authorized = resolveAuthorizedUser(input.agentAuthorizedPersonId);
  if (authorized) {
    actors.push({
      key: 'agentAuthorized',
      limits: {
        singleTxLimit: authorized.dailyLimit,
        dailyLimit: authorized.dailyLimit,
        monthlyLimit: -1,
        internationalTransfer: 'Allowed',
      },
      usage,
      activeAndAuthorized: authorized.active,
    });
  }

  if (input.corporateAuthorizedPersonId) {
    actors.push({
      key: 'corporateAuthorized',
      limits: {
        singleTxLimit: 100_000,
        dailyLimit: 250_000,
        monthlyLimit: -1,
        internationalTransfer: 'Allowed',
      },
      usage: { dailyUsed: 0, monthlyUsed: 0 },
      activeAndAuthorized: true,
    });
  }

  return actors;
}

/** Demo — yerel §8.1 hesaplama; production'da HTTP adapter kullanılır. */
export function createMockAgentRemainingLimitAdapter(): AgentRemainingLimitPort {
  return {
    async getRemainingLimit(input): Promise<AgentRemainingLimitResponse> {
      const isForeign = input.operationType === 'InternationalTransfer';
      const computed = computeRemainingLimit({
        asOf: input.asOf,
        operationType: input.operationType,
        channel: input.channel,
        currency: input.currency,
        isForeign,
        actors: buildMockActors(input),
      });

      return {
        ok: true,
        data: {
          asOf: computed.asOf,
          operationType: computed.operationType,
          channel: computed.channel,
          currency: computed.currency,
          nextTxMaxAmount: computed.nextTxMaxAmount,
          todayRemaining: computed.todayRemaining,
          monthRemaining: computed.monthRemaining,
          singleTxLimit: computed.singleTxLimit,
        },
      };
    },
  };
}
