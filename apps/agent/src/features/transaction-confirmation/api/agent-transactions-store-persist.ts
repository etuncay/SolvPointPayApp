import { AGENT_TX_STORE_KEY_PREFIX } from '@/config/app';
import type { Transaction } from '@/mocks/transactions';
import type { DeclarationInput, SecurityChecks } from '../domain/types';

export const AGENT_TX_STORE_VERSION = 1;

export type ReceiptState = {
  generated: boolean;
  signedFileName: string | null;
};

export type PersistedAgentTxStore = {
  v: number;
  agentId: number;
  records: Transaction[];
  nextRecordId: number;
  security: Array<[number, SecurityChecks]>;
  declarations: Array<[number, DeclarationInput]>;
  receipts: Array<[number, ReceiptState]>;
};

export type MutableAgentTxState = {
  records: Transaction[];
  nextRecordId: number;
  security: Map<number, SecurityChecks>;
  declarations: Map<number, DeclarationInput>;
  receipts: Map<number, ReceiptState>;
};

export function agentTxStorageKey(agentId: number): string {
  return `${AGENT_TX_STORE_KEY_PREFIX}:${agentId}`;
}

export function toPersisted(agentId: number, state: MutableAgentTxState): PersistedAgentTxStore {
  return {
    v: AGENT_TX_STORE_VERSION,
    agentId,
    records: state.records,
    nextRecordId: state.nextRecordId,
    security: [...state.security.entries()],
    declarations: [...state.declarations.entries()],
    receipts: [...state.receipts.entries()],
  };
}

export function fromPersisted(persisted: PersistedAgentTxStore): MutableAgentTxState {
  return {
    records: persisted.records,
    nextRecordId: persisted.nextRecordId,
    security: new Map(persisted.security),
    declarations: new Map(persisted.declarations),
    receipts: new Map(persisted.receipts),
  };
}

export function loadPersistedAgentTxStore(agentId: number): PersistedAgentTxStore | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(agentTxStorageKey(agentId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedAgentTxStore;
    if (parsed.v !== AGENT_TX_STORE_VERSION || parsed.agentId !== agentId) return null;
    if (!Array.isArray(parsed.records) || typeof parsed.nextRecordId !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePersistedAgentTxStore(agentId: number, snapshot: PersistedAgentTxStore): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(agentTxStorageKey(agentId), JSON.stringify(snapshot));
  } catch {
    // quota / private mode — sessizce bellek içi kalır
  }
}

export function clearPersistedAgentTxStore(agentId: number): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(agentTxStorageKey(agentId));
}
