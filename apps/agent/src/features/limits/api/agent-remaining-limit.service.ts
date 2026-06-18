import type { DataDriver } from '@epay/data';
import type { AgentRemainingLimitPort } from '../contracts/agent-remaining-limit-port';
import { createHttpAgentRemainingLimitAdapter } from './http-agent-remaining-limit.adapter';
import { createMockAgentRemainingLimitAdapter } from './mock-agent-remaining-limit.adapter';

let port: AgentRemainingLimitPort | null = null;

export function setAgentRemainingLimitPort(next: AgentRemainingLimitPort): void {
  port = next;
}

function resolvePort(): AgentRemainingLimitPort {
  if (!port) {
    throw new Error('[agent-remaining-limit] Port not configured — call configureAgentLimitPorts()');
  }
  return port;
}

export const agentRemainingLimitApi: AgentRemainingLimitPort = {
  getRemainingLimit(input) {
    return resolvePort().getRemainingLimit(input);
  },
};

export function configureAgentLimitPorts(options: {
  driver?: DataDriver;
  apiBaseUrl?: string;
}): void {
  if (options.driver === 'http' && options.apiBaseUrl?.trim()) {
    setAgentRemainingLimitPort(createHttpAgentRemainingLimitAdapter(options.apiBaseUrl.trim()));
    return;
  }
  setAgentRemainingLimitPort(createMockAgentRemainingLimitAdapter());
}

configureAgentLimitPorts({ driver: 'dexie' });
