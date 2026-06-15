import type { FormReferenceApi } from '../contracts/form-reference-api';
import { createDexieFormReferenceAdapter } from '../adapters/dexie/form-reference-dexie.adapter';

let port: FormReferenceApi | null = null;

export function setFormReferenceApiPort(next: FormReferenceApi): void {
  port = next;
}

export function getFormReferenceApiPort(): FormReferenceApi | null {
  return port;
}

function resolvePort(): FormReferenceApi {
  if (!port) {
    port = createDexieFormReferenceAdapter();
  }
  return port;
}

export const formReferenceApi: FormReferenceApi = {
  getOptions(endpoint, param) {
    return resolvePort().getOptions(endpoint, param);
  },
};
