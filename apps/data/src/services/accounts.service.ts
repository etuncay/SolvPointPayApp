import type { AccountsApi } from '../contracts/accounts-api';
import { createDexieAccountsAdapter } from '../adapters/dexie/accounts-dexie.adapter';

let port: AccountsApi | null = null;

export function setAccountsApiPort(next: AccountsApi): void {
  port = next;
}

export function getAccountsApiPort(): AccountsApi | null {
  return port;
}

function resolvePort(): AccountsApi {
  if (!port) {
    port = createDexieAccountsAdapter();
  }
  return port;
}

/** UI ve feature modüllerinin çağırdığı mock-backend yüzeyi. */
export const accountsApi: AccountsApi = {
  listBalances() {
    return resolvePort().listBalances();
  },
  listActivities(params) {
    return resolvePort().listActivities(params);
  },
};
