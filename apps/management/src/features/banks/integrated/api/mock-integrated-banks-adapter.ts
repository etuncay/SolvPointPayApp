import { INTEGRATED_BANKS_SEED } from '@/mocks/integrated-banks';
import { applyDefaultSwap, getDeactivateError } from '../domain/default-rules';
import { validateIntegratedBankInput } from '../domain/validation';
import type {
  IntegratedBank,
  IntegratedBankFilters,
  IntegratedBankInput,
  IntegratedBankUpdateInput,
  SaveIntegratedBankResult,
} from '../domain/types';
import type { IntegratedBankChangeLogEntry, IntegratedBanksService } from './integrated-banks-service';

let store: IntegratedBank[] = INTEGRATED_BANKS_SEED.map((b) => ({ ...b }));
let nextId = 100;
let nextLogId = 1;
let changeLog: IntegratedBankChangeLogEntry[] = [];

function nowIso(): string {
  return new Date().toISOString();
}

function appendLog(
  action: IntegratedBankChangeLogEntry['action'],
  entityId: number,
  previous: unknown,
  next: unknown,
) {
  changeLog = [
    ...changeLog,
    { id: nextLogId++, action, entityId, previous, next, at: nowIso(), by: 'current.user' },
  ];
}

function sortRows(rows: IntegratedBank[]): IntegratedBank[] {
  return [...rows].sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === 'Active') return -1;
      if (b.status === 'Active') return 1;
    }
    const aDefault = a.isDefaultEft || a.isDefaultIbanCheck || a.isDefaultFast;
    const bDefault = b.isDefaultEft || b.isDefaultIbanCheck || b.isDefaultFast;
    if (aDefault !== bDefault) return aDefault ? -1 : 1;
    return a.bankName.localeCompare(b.bankName, 'tr');
  });
}

function applyFilters(rows: IntegratedBank[], filters: IntegratedBankFilters): IntegratedBank[] {
  const q = filters.query.trim().toLowerCase();
  return rows.filter((b) => {
    if (b.recordStatus !== 1) return false;
    if (filters.status !== 'any' && b.status !== filters.status) return false;
    if (!q) return true;
    return (
      b.bankName.toLowerCase().includes(q) ||
      b.service.toLowerCase().includes(q)
    );
  });
}

function mergeInput(existing: IntegratedBank, input: IntegratedBankInput): IntegratedBank {
  return {
    ...existing,
    ...input,
    isDefaultIbanCheck: input.hasIbanCheck ? input.isDefaultIbanCheck : false,
    isDefaultFast: input.hasFast ? input.isDefaultFast : false,
  };
}

function applyDefaultsToStore(targetId: number, input: IntegratedBankInput) {
  store = applyDefaultSwap(store, targetId, input);
}

export const mockIntegratedBanksAdapter: IntegratedBanksService = {
  list(filters = { query: '', status: 'any' }) {
    return sortRows(applyFilters(store, filters));
  },

  create(input: IntegratedBankInput): SaveIntegratedBankResult {
    const validated = validateIntegratedBankInput(input);
    if (!validated.ok) return { ok: false, error: validated.error };

    const id = nextId++;
    const row: IntegratedBank = {
      id,
      ...validated.data,
      isDefaultIbanCheck: validated.data.hasIbanCheck ? validated.data.isDefaultIbanCheck : false,
      isDefaultFast: validated.data.hasFast ? validated.data.isDefaultFast : false,
      lastSuccessCallAt: null,
      status: 'Active',
      recordStatus: 1,
    };

    applyDefaultsToStore(id, validated.data);
    store = [...store, row];
    appendLog('create', id, null, row);
    return { ok: true, id };
  },

  update(id: number, input: IntegratedBankUpdateInput): SaveIntegratedBankResult {
    const existing = store.find((b) => b.id === id && b.recordStatus === 1);
    if (!existing) return { ok: false, error: 'ib_not_found' };
    if (existing.status === 'Inactive') return { ok: false, error: 'ib_inactive_locked' };

    const validated = validateIntegratedBankInput(input);
    if (!validated.ok) return { ok: false, error: validated.error };

    applyDefaultsToStore(id, validated.data);
    const row = mergeInput(existing, validated.data);
    store = store.map((b) => (b.id === id ? row : b));
    appendLog('update', id, existing, row);
    return { ok: true, id };
  },

  deactivate(id: number): SaveIntegratedBankResult {
    const existing = store.find((b) => b.id === id && b.recordStatus === 1);
    if (!existing) return { ok: false, error: 'ib_not_found' };
    if (existing.status === 'Inactive') return { ok: true, id };

    const guard = getDeactivateError(existing, store);
    if (guard) return { ok: false, error: guard };

    const row: IntegratedBank = { ...existing, status: 'Inactive' };
    store = store.map((b) => (b.id === id ? row : b));
    appendLog('deactivate', id, existing, row);
    return { ok: true, id };
  },

  getChangeLog() {
    return [...changeLog];
  },
};

/** Test reset */
export function resetIntegratedBanksStore() {
  store = INTEGRATED_BANKS_SEED.map((b) => ({ ...b }));
  nextId = 100;
  nextLogId = 1;
  changeLog = [];
}

export function getIntegratedBanksStoreSnapshot(): IntegratedBank[] {
  return store.map((b) => ({ ...b }));
}
