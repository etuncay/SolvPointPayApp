import { userDisplayNameById } from '@/mocks/app-users';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import { PARAMETER_CATALOG, getCatalogEntry } from '@/features/system/parameters/domain/parameter-catalog';
import { parseParameterValue } from '@/features/system/parameters/domain/validate-parameter-value';
import type { SystemParameter } from '@/features/system/parameters/domain/types';

const CHANGED_BY = MOCK_USER_IDS.management;
const CHANGED_AT = '2026-05-24T10:00:00Z';

function shouldSeed(entry: (typeof PARAMETER_CATALOG)[number]): boolean {
  return entry.seed !== false;
}

function seedRow(entry: (typeof PARAMETER_CATALOG)[number], index: number): SystemParameter {
  return {
    id: `prm-${String(index + 1).padStart(3, '0')}`,
    groupName: entry.groupName,
    parameterKey: entry.parameterKey,
    value: entry.defaultValue,
    valueType: entry.valueType,
    description: entry.descriptionKey,
    status: 'Active',
    changedBy: CHANGED_BY,
    changedByName: userDisplayNameById(CHANGED_BY),
    changedAt: CHANGED_AT,
    recordStatus: 1,
  };
}

let store: SystemParameter[] = PARAMETER_CATALOG.filter(shouldSeed).map((e, i) => seedRow(e, i));

export function resetSystemParametersStore(): void {
  store = PARAMETER_CATALOG.filter(shouldSeed).map((e, i) => seedRow(e, i));
}

export function getSystemParametersStore(): SystemParameter[] {
  return store.filter((p) => p.recordStatus === 1);
}

export function getParameterById(id: string): SystemParameter | undefined {
  return store.find((p) => p.id === id && p.recordStatus === 1);
}

export function getParameterByKey(key: string): SystemParameter | undefined {
  return store.find((p) => p.parameterKey === key && p.recordStatus === 1);
}

export function updateParameterRecord(
  id: string,
  patch: Partial<Pick<SystemParameter, 'value' | 'status' | 'changedBy' | 'changedByName' | 'changedAt'>>,
): SystemParameter | undefined {
  const idx = store.findIndex((p) => p.id === id);
  if (idx < 0) return undefined;
  const next = { ...store[idx]!, ...patch };
  store = [...store.slice(0, idx), next, ...store.slice(idx + 1)];
  return next;
}

export function createParameterRecord(
  input: Omit<SystemParameter, 'id' | 'recordStatus'>,
): SystemParameter | undefined {
  if (getParameterByKey(input.parameterKey)) return undefined;
  const maxNum = store.reduce((max, row) => {
    const n = Number.parseInt(row.id.replace(/^prm-/, ''), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  const row: SystemParameter = {
    ...input,
    id: `prm-${String(maxNum + 1).padStart(3, '0')}`,
    recordStatus: 1,
  };
  store = [...store, row];
  return row;
}

export function getParameterValue<T>(key: string, fallback: T): T {
  const row = getParameterByKey(key);
  const entry = getCatalogEntry(key);
  if (!row || !entry) {
    if (typeof fallback !== 'undefined') return fallback;
    return fallback;
  }
  if (row.status === 'Passive') {
    console.warn(`[parameters] Passive key "${key}" — using catalog default`);
    return parseParameterValue(entry.valueType, entry.defaultValue, fallback);
  }
  return parseParameterValue(entry.valueType, row.value, fallback);
}

export function getActiveParameterValue<T>(key: string, fallback: T): T {
  const row = getParameterByKey(key);
  const entry = getCatalogEntry(key);
  if (!row || row.status !== 'Active' || !entry) {
    if (entry) return parseParameterValue(entry.valueType, entry.defaultValue, fallback);
    return fallback;
  }
  return parseParameterValue(entry.valueType, row.value, fallback);
}
