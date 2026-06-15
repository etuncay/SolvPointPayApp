import {
  applyCancel,
  applyHold,
  applyRetry,
  isErrorStatus,
  runMockRetryPipeline,
} from '@/features/operational-processes/shared/integration-transitions';
import type { IntegrationActionLog, IntegrationActionResult } from '@/features/operational-processes/shared/integration-types';
import {
  BTRANS_AUDIT_SEED,
  BTRANS_INTEGRATIONS_SEED,
  type BtransIntegrationRecord,
} from '@/mocks/btrans-integrations';
import {
  externalBtransRefExists,
  registerExternalBtransRef,
} from '@/mocks/external-btrans-system';
import type { BackOfficeRole } from '@epay/ui';
import { getBtransPermissions } from '../domain/permissions';
import type {
  BtransIntegrationDetail,
  BtransIntegrationFilters,
  BtransIntegrationRow,
} from '../domain/types';
import type { BtransIntegrationsService } from './btrans-integrations-service';

const PERFORMER: Record<BackOfficeRole, string> = {
  finance: 'Fatma Kaya',
  management: 'Mehmet Şahin',
  ops: 'Ahmet Yılmaz',
  compliance: 'Ayşe Demir',
  alltest: 'All Test',
};

let store: BtransIntegrationRecord[] = BTRANS_INTEGRATIONS_SEED.map((r) => ({ ...r }));
const auditLog = new Map<string, IntegrationActionLog[]>(
  Object.entries(BTRANS_AUDIT_SEED).map(([k, v]) => [k, [...v]]),
);

function guard(role: BackOfficeRole, action: keyof ReturnType<typeof getBtransPermissions>): IntegrationActionResult | null {
  const p = getBtransPermissions(role);
  if (!p[action]) return { ok: false, error: 'fx_forbidden' };
  return null;
}

function appendAudit(
  id: string,
  action: string,
  role: BackOfficeRole,
  before: BtransIntegrationRecord['status'],
  after: BtransIntegrationRecord['status'],
  correlationId: string,
) {
  const list = auditLog.get(id) ?? [];
  list.unshift({
    action,
    performedBy: PERFORMER[role],
    correlationId,
    beforeStatus: before,
    afterStatus: after,
    at: new Date('2026-05-24T12:00:00Z').toISOString(),
  });
  auditLog.set(id, list.slice(0, 20));
}

function matchesStatus(rec: BtransIntegrationRecord, filter: BtransIntegrationFilters['status']): boolean {
  if (filter === 'all') return true;
  if (filter === 'error') return isErrorStatus(rec.status);
  return rec.status === filter;
}

function matchesReportName(rec: BtransIntegrationRecord, reportName: BtransIntegrationFilters['reportName']): boolean {
  if (reportName === 'all') return true;
  return rec.reportName === reportName;
}

function matchesDateRange(rec: BtransIntegrationRecord, from: string, to: string): boolean {
  if (from && rec.reportDate < from) return false;
  if (to && rec.reportDate > to) return false;
  return true;
}

function sortRows(rows: BtransIntegrationRow[]): BtransIntegrationRow[] {
  return [...rows].sort((a, b) => {
    const dateCmp = b.reportDate.localeCompare(a.reportDate);
    if (dateCmp !== 0) return dateCmp;
    const aSent = a.lastSentAt ?? '';
    const bSent = b.lastSentAt ?? '';
    return bSent.localeCompare(aSent);
  });
}

export const mockBtransIntegrationsAdapter: BtransIntegrationsService = {
  list(filters, role) {
    const g = guard(role, 'list');
    if (g) return [];
    return sortRows(
      store
        .filter((r) => r.integrationType === 'BTrans')
        .filter((r) => matchesStatus(r, filters.status))
        .filter((r) => matchesReportName(r, filters.reportName))
        .filter((r) => matchesDateRange(r, filters.dateFrom, filters.dateTo)),
    );
  },

  getById(id, role) {
    const g = guard(role, 'view');
    if (g) return null;
    const rec = store.find((r) => r.id === id);
    if (!rec) return null;
    return { ...rec, actionLog: [...(auditLog.get(id) ?? [])] };
  },

  retry(id, role) {
    const g = guard(role, 'retry');
    if (g) return g;
    const idx = store.findIndex((r) => r.id === id);
    if (idx < 0) return { ok: false, error: 'finrec_not_found' };
    const rec = store[idx]!;
    const next = applyRetry(rec.status);
    if (!next) return { ok: false, error: 'int_invalid_transition' };
    if (rec.externalRefId && externalBtransRefExists(rec.externalRefId)) {
      return { ok: true, deduplicated: true, status: rec.status };
    }
    const before = rec.status;
    rec.status = next;
    rec.attemptCount += 1;
    appendAudit(id, 'retry', role, before, next, rec.correlationId);
    const finalStatus = runMockRetryPipeline(id !== 'BTR-013');
    rec.status = finalStatus;
    rec.lastSentAt = new Date('2026-05-24T12:00:00Z').toISOString();
    if (finalStatus === 'Completed') {
      rec.serviceOutput = `Report resubmitted — ${rec.referenceNo}`;
      rec.responseJson = { result: 'OK', gibRef: `GIB-${id}-R${rec.attemptCount}` };
      if (!rec.externalRefId) {
        rec.externalRefId = `EXT-${id}`;
        registerExternalBtransRef(rec.externalRefId);
      }
    } else if (finalStatus === 'ErrorSend') {
      rec.serviceOutput = 'Retry failed: BTRANS gateway timeout';
      rec.responseJson = { result: 'ERROR', code: 'ErrorSend' };
    }
    appendAudit(id, 'retry_complete', role, next, finalStatus, rec.correlationId);
    store[idx] = rec;
    return { ok: true, status: finalStatus };
  },

  hold(id, role) {
    const g = guard(role, 'hold');
    if (g) return g;
    const idx = store.findIndex((r) => r.id === id);
    if (idx < 0) return { ok: false, error: 'finrec_not_found' };
    const rec = store[idx]!;
    const next = applyHold(rec.status);
    if (!next) return { ok: false, error: 'int_invalid_transition' };
    const before = rec.status;
    rec.status = next;
    rec.serviceOutput = 'Manually held — awaiting review';
    appendAudit(id, 'hold', role, before, next, rec.correlationId);
    store[idx] = rec;
    return { ok: true, status: next };
  },

  cancel(id, role) {
    const g = guard(role, 'cancel');
    if (g) return g;
    const idx = store.findIndex((r) => r.id === id);
    if (idx < 0) return { ok: false, error: 'finrec_not_found' };
    const rec = store[idx]!;
    const next = applyCancel(rec.status);
    if (!next) return { ok: false, error: 'int_invalid_transition' };
    const before = rec.status;
    rec.status = next;
    rec.serviceOutput = 'BTRANS submission canceled by operator';
    appendAudit(id, 'cancel', role, before, next, rec.correlationId);
    store[idx] = rec;
    return { ok: true, status: next };
  },
};

export function resetBtransIntegrationsStoreForTest(): void {
  store = BTRANS_INTEGRATIONS_SEED.map((r) => ({ ...r }));
  auditLog.clear();
  for (const [k, v] of Object.entries(BTRANS_AUDIT_SEED)) {
    auditLog.set(k, [...v]);
  }
}
