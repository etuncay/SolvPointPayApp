import { CUSTOMER_FEES } from '@/mocks/customer-fees';
import { calculateFee, hasActiveBaseTier } from '../domain/calculate-fee';
import { sortFees } from '../domain/sort-fees';
import { feeComboKey, type CustomerFee, type CustomerFeeFilters, type CustomerFeeInput } from '../domain/types';
import { validateCustomerFeeInput } from '../domain/validation';
import type { CustomerFeesService, FeeChangeLogEntry } from './customer-fees-service';
import { registerCustomerFeeApprovalApply } from './customer-fee-approval-bridge';

let store: CustomerFee[] = CUSTOMER_FEES.map((f) => ({ ...f }));
let nextId = 2000;
let nextLogId = 1;
let changeLog: FeeChangeLogEntry[] = [];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowIso(): string {
  return new Date().toISOString();
}

function appendLog(
  action: FeeChangeLogEntry['action'],
  feeId: number,
  previous: CustomerFee | null,
  next: CustomerFee | null,
) {
  changeLog = [
    ...changeLog,
    {
      id: nextLogId++,
      action,
      feeId,
      previous: previous ? { ...previous } : null,
      next: next ? { ...next } : null,
      at: nowIso(),
      by: 'current.user',
    },
  ];
}

function passivateFee(id: number, endDate: string): CustomerFee | null {
  const idx = store.findIndex((f) => f.id === id);
  if (idx < 0) return null;
  const prev = store[idx]!;
  if (prev.status === 'Passive') return prev;
  const next: CustomerFee = {
    ...prev,
    status: 'Passive',
    endDate: prev.endDate ?? endDate,
    changedAt: nowIso(),
    changedBy: 'current.user',
  };
  store = store.map((f, i) => (i === idx ? next : f));
  appendLog('passivate', id, prev, next);
  return next;
}

function applyFilters(rows: CustomerFee[], filters: CustomerFeeFilters): CustomerFee[] {
  const q = filters.query.trim().toLowerCase();
  return rows.filter((f) => {
    if (f.recordStatus !== 1) return false;
    if (filters.transactionType !== 'any' && f.transactionType !== filters.transactionType) return false;
    if (filters.currency !== 'any' && f.currency !== filters.currency) return false;
    if (filters.status !== 'any' && f.status !== filters.status) return false;
    if (!q) return true;
    return (
      f.transactionType.toLowerCase().includes(q) ||
      f.currency.toLowerCase().includes(q) ||
      f.sourceCountry.toLowerCase().includes(q) ||
      f.targetCountry.toLowerCase().includes(q)
    );
  });
}

function buildRow(input: CustomerFeeInput, id: number): CustomerFee {
  const ts = nowIso();
  return {
    id,
    transactionType: input.transactionType,
    currency: input.currency,
    lowerLimit: input.lowerLimit,
    fixedFee: input.fixedFee,
    variableFeePct: input.variableFeePct,
    startDate: input.startDate?.trim() || today(),
    endDate: input.endDate?.trim() || null,
    sourceCountry: input.sourceCountry,
    targetCountry: input.targetCountry,
    status: 'Active',
    changedBy: 'current.user',
    changedAt: ts,
    recordStatus: 1,
  };
}

function passivateConflicting(input: CustomerFeeInput): void {
  const key = feeComboKey(input);
  const date = today();
  for (const f of store) {
    if (f.recordStatus !== 1 || f.status !== 'Active') continue;
    if (feeComboKey(f) === key) {
      passivateFee(f.id, date);
    }
  }
}

function passivateIdsForCreate(input: CustomerFeeInput): number[] {
  const key = feeComboKey(input);
  return store
    .filter((f) => f.recordStatus === 1 && f.status === 'Active' && feeComboKey(f) === key)
    .map((f) => f.id);
}

function passivateIdsForUpdate(id: number, input: CustomerFeeInput): number[] {
  const key = feeComboKey(input);
  const ids = new Set<number>([id]);
  for (const f of store) {
    if (f.id === id) continue;
    if (f.recordStatus !== 1 || f.status !== 'Active') continue;
    if (feeComboKey(f) === key) ids.add(f.id);
  }
  return [...ids];
}

/** Pasifleştirme + yeni kayıt sonrası base tier korunuyor mu (spec §7) */
function assertBaseTierPreserved(input: CustomerFeeInput, passivateIds: number[]): string | null {
  const date = today();
  const after = [
    ...store.map((f) =>
      passivateIds.includes(f.id) ? { ...f, status: 'Passive' as const } : f,
    ),
    buildRow(input, -1),
  ];
  if (!hasActiveBaseTier(after, input.transactionType, input.currency, date)) {
    return 'cfe_base_tier_required';
  }
  return null;
}

export const mockCustomerFeesAdapter: CustomerFeesService = {
  list(filters = { query: '', transactionType: 'any', currency: 'any', status: 'Active' }) {
    mockCustomerFeesAdapter.runBatchExpire();
    return sortFees(applyFilters(store, filters));
  },

  create(input) {
    const err = validateCustomerFeeInput(input);
    if (err) return { ok: false, error: err };

    const passivateIds = passivateIdsForCreate(input);
    const tierErr = assertBaseTierPreserved(input, passivateIds);
    if (tierErr) return { ok: false, error: tierErr };

    passivateConflicting(input);
    const row = buildRow(input, nextId++);
    store = [...store, row];
    appendLog('create', row.id, null, row);
    return { ok: true, id: row.id };
  },

  update(id, input) {
    const existing = store.find((f) => f.id === id && f.recordStatus === 1);
    if (!existing) return { ok: false, error: 'finrec_not_found' };
    if (existing.status === 'Passive') return { ok: false, error: 'cfe_passive_readonly' };

    const err = validateCustomerFeeInput(input);
    if (err) return { ok: false, error: err };

    const passivateIds = passivateIdsForUpdate(id, input);
    const tierErr = assertBaseTierPreserved(input, passivateIds);
    if (tierErr) return { ok: false, error: tierErr };

    const date = today();
    passivateFee(id, date);
    passivateConflicting(input);
    const row = buildRow(input, nextId++);
    store = [...store, row];
    appendLog('update', row.id, existing, row);
    return { ok: true, id: row.id };
  },

  calculate(params) {
    mockCustomerFeesAdapter.runBatchExpire();
    return calculateFee(store, params);
  },

  runBatchExpire() {
    const date = today();
    let count = 0;
    store = store.map((f) => {
      if (f.recordStatus !== 1 || f.status !== 'Active') return f;
      const futureStart = f.startDate && f.startDate > date;
      const pastEnd = f.endDate && f.endDate < date;
      if (!futureStart && !pastEnd) return f;
      count += 1;
      const prev = { ...f };
      const next: CustomerFee = {
        ...f,
        status: 'Passive',
        changedAt: nowIso(),
        changedBy: 'system.batch',
      };
      appendLog('batch_expire', f.id, prev, next);
      return next;
    });
    return count;
  },
};

export function getFeeChangeLog(): FeeChangeLogEntry[] {
  return [...changeLog];
}

export function resetCustomerFeesStore(): void {
  store = CUSTOMER_FEES.map((f) => ({ ...f }));
  nextId = 2000;
  nextLogId = 1;
  changeLog = [];
}

registerCustomerFeeApprovalApply((meta) => {
  if (meta.mode === 'new') {
    mockCustomerFeesAdapter.create(meta.input);
  } else if (meta.feeId != null) {
    mockCustomerFeesAdapter.update(meta.feeId, meta.input);
  }
});
