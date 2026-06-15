import { BANK_ACCOUNT_MOVEMENTS_SEED } from '@/mocks/bank-account-movements';
import type { BackOfficeRole } from '@epay/ui';
import { applyBankMovementFilters } from '../domain/apply-bank-movement-filters';
import { movementUniqueKey } from '../domain/duplicate-key';
import { getBankMovementPermissions } from '../domain/permissions';
import type {
  BankAccountMovement,
  BankMovementFilters,
  BankMovementIngestInput,
  BankMovementIngestResult,
} from '../domain/types';
import type { BankMovementAccessLogEntry, BankMovementsService } from './bank-movements-service';

let store: BankAccountMovement[] = BANK_ACCOUNT_MOVEMENTS_SEED.map((m) => ({ ...m }));
let nextId = 10_000;
let nextLogId = 1;
let accessLog: BankMovementAccessLogEntry[] = [];

const CURRENT_USER = 'current.user';

function nowIso(): string {
  return new Date().toISOString();
}

function appendAccessLog(
  action: BankMovementAccessLogEntry['action'],
  count?: number,
  movementId?: number,
) {
  accessLog = [
    ...accessLog,
    { id: nextLogId++, action, count, movementId, at: nowIso(), by: CURRENT_USER },
  ];
}

function canAccess(role: BackOfficeRole): boolean {
  return getBankMovementPermissions(role).list;
}

function filtered(filters: BankMovementFilters, role: BackOfficeRole): BankAccountMovement[] {
  if (!canAccess(role)) return [];
  const sorted = [...store]
    .filter((m) => m.recordStatus === 1)
    .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
  return applyBankMovementFilters(sorted, filters);
}

function hasDuplicateKey(key: string): boolean {
  return store.some((m) => m.recordStatus === 1 && movementUniqueKey(m) === key);
}

export const mockBankMovementsAdapter: BankMovementsService = {
  list(filters, role) {
    const rows = filtered(filters, role);
    appendAccessLog('list', rows.length);
    return rows;
  },

  exportRows(filters, role) {
    const rows = filtered(filters, role);
    appendAccessLog('export', rows.length);
    return rows;
  },

  ingest(payload: BankMovementIngestInput): BankMovementIngestResult {
    if (payload.amount <= 0) {
      return { ok: false, error: 'bm_amount_invalid' };
    }

    const key = movementUniqueKey(payload);
    if (hasDuplicateKey(key)) {
      appendAccessLog('ingest_duplicate');
      return { ok: false, duplicate: true };
    }

    const id = nextId++;
    const row: BankAccountMovement = { ...payload, id, recordStatus: 1 };
    store = [...store, row];
    appendAccessLog('ingest', 1, id);
    return { ok: true, id };
  },

  getAccessLog() {
    return [...accessLog];
  },
};

export function resetBankMovementsStore() {
  store = BANK_ACCOUNT_MOVEMENTS_SEED.map((m) => ({ ...m }));
  nextId = 10_000;
  nextLogId = 1;
  accessLog = [];
}

export function getBankMovementsStoreSnapshot(): BankAccountMovement[] {
  return store.map((m) => ({ ...m }));
}
