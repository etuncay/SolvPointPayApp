import type { AgentRegistrationApi } from '../contracts/registration-api';
import { createDexieAgentRegistrationAdapter } from '../adapters/dexie/registration-dexie.adapter';

let port: AgentRegistrationApi | null = null;

export function setAgentRegistrationApiPort(next: AgentRegistrationApi): void {
  port = next;
}

export function getAgentRegistrationApiPort(): AgentRegistrationApi | null {
  return port;
}

function resolvePort(): AgentRegistrationApi {
  if (!port) {
    port = createDexieAgentRegistrationAdapter();
  }
  return port;
}

/** UI ve feature modüllerinin çağırdığı mock-backend yüzeyi. */
export const agentRegistrationApi: AgentRegistrationApi = {
  getById(id) {
    return resolvePort().getById(id);
  },
  lookupByIdentityNo(idNo) {
    return resolvePort().lookupByIdentityNo(idNo);
  },
  hasPendingTransfer(idNo) {
    return resolvePort().hasPendingTransfer(idNo);
  },
  save(values, opts) {
    return resolvePort().save(values, opts);
  },
};
