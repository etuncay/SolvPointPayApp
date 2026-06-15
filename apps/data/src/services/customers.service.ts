import type { CustomersApi } from '../contracts/customers-api';
import { createDexieCustomersAdapter } from '../adapters/dexie/customers-dexie.adapter';

let port: CustomersApi | null = null;

export function setCustomersApiPort(next: CustomersApi): void {
  port = next;
}

export function getCustomersApiPort(): CustomersApi | null {
  return port;
}

function resolvePort(): CustomersApi {
  if (!port) {
    port = createDexieCustomersAdapter();
  }
  return port;
}

/** UI ve feature modüllerinin çağırdığı mock-backend yüzeyi */
export const customersApi: CustomersApi = {
  list(params) {
    return resolvePort().list(params);
  },
  getById(id) {
    return resolvePort().getById(id);
  },
  create(values) {
    return resolvePort().create(values);
  },
  update(id, values) {
    return resolvePort().update(id, values);
  },
  delete(id) {
    return resolvePort().delete(id);
  },
};
