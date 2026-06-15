import {
  applyCancel,
  applyHold,
  applyRetry,
  isErrorStatus,
  runMockRetryPipeline,
} from '@/features/operational-processes/shared/integration-transitions';
import type { IntegrationActionLog, IntegrationActionResult } from '@/features/operational-processes/shared/integration-types';
import {
  ACCOUNTING_AUDIT_SEED,
  ACCOUNTING_INTEGRATIONS_SEED,
  type AccountingIntegrationRecord,
} from '@/mocks/accounting-integrations';
import {
  externalAccountingRefExists,
  registerExternalAccountingRef,
} from '@/mocks/external-accounting-system';
import { TRANSACTIONS } from '@/mocks/transactions';
import { getIntegrationConfig } from '@/features/system/integrations/api/mock-integrations-adapter';
import type { BackOfficeRole } from '@epay/ui';
import { getAccountingPermissions } from '../domain/permissions';
import { shortenServiceOutput } from '../domain/service-output';
import type {
  AccountingIntegrationDetail,
  AccountingIntegrationFilters,
  AccountingIntegrationRow,
} from '../domain/types';
import type { AccountingIntegrationsService } from './accounting-integrations-service';

const PERFORMER: Record<BackOfficeRole, string> = {
  finance: 'Fatma Kaya',
  management: 'Mehmet Şahin',
  ops: 'Ahmet Yılmaz',
  compliance: 'Ayşe Demir',
  alltest: 'All Test',
};

let store: AccountingIntegrationRecord[] = ACCOUNTING_INTEGRATIONS_SEED.map((r) => ({ ...r }));
const auditLog = new Map<string, IntegrationActionLog[]>(
  Object.entries(ACCOUNTING_AUDIT_SEED).map(([k, v]) => [k, [...v]]),
);

function guard(role: BackOfficeRole, action: keyof ReturnType<typeof getAccountingPermissions>): IntegrationActionResult | null {
  const p = getAccountingPermissions(role);
  if (!p[action]) return { ok: false, error: 'fx_forbidden' };
  return null;
}

function appendAudit(
  id: string,
  action: string,
  role: BackOfficeRole,
  before: AccountingIntegrationRecord['status'],
  after: AccountingIntegrationRecord['status'],
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

function toRow(rec: AccountingIntegrationRecord): AccountingIntegrationRow {
  return {
    ...rec,
    senderDisplay: `${rec.senderName} (${rec.senderNo})`,
    receiverDisplay: `${rec.receiverName} (${rec.receiverNo})`,
    serviceOutputShort: shortenServiceOutput(rec.serviceOutput),
  };
}

function matchesStatus(rec: AccountingIntegrationRecord, filter: AccountingIntegrationFilters['status']): boolean {
  if (filter === 'all') return true;
  if (filter === 'error') return isErrorStatus(rec.status);
  return rec.status === filter;
}

function matchesQuery(rec: AccountingIntegrationRecord, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    rec.referenceNo.toLowerCase().includes(q) ||
    rec.senderNo.toLowerCase().includes(q) ||
    rec.receiverNo.toLowerCase().includes(q) ||
    rec.senderName.toLowerCase().includes(q) ||
    rec.receiverName.toLowerCase().includes(q)
  );
}

function sortRows(rows: AccountingIntegrationRow[]): AccountingIntegrationRow[] {
  return [...rows].sort(
    (a, b) => new Date(b.transactionAt).getTime() - new Date(a.transactionAt).getTime(),
  );
}

export const mockAccountingIntegrationsAdapter: AccountingIntegrationsService = {
  list(filters, role) {
    const g = guard(role, 'list');
    if (g) return [];
    return sortRows(
      store
        .filter((r) => r.integrationType === 'Accounting')
        .filter((r) => matchesStatus(r, filters.status))
        .filter((r) => matchesQuery(r, filters.query))
        .map(toRow),
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
    const cfg = getIntegrationConfig(rec.integrationDefinitionId ?? 'int-001');
    if (cfg && rec.attemptCount >= cfg.maxRetry) {
      return { ok: false, error: 'int_max_retry_exceeded' };
    }
    const next = applyRetry(rec.status);
    if (!next) return { ok: false, error: 'int_invalid_transition' };
    if (rec.externalRefId && externalAccountingRefExists(rec.externalRefId)) {
      return { ok: true, deduplicated: true, status: rec.status };
    }
    const before = rec.status;
    rec.status = next;
    rec.attemptCount += 1;
    appendAudit(id, 'retry', role, before, next, rec.correlationId);
    const finalStatus = runMockRetryPipeline(id !== 'ACC-013');
    rec.status = finalStatus;
    rec.lastSentAt = new Date('2026-05-24T12:00:00Z').toISOString();
    if (finalStatus === 'Completed') {
      rec.serviceOutput = `Voucher reposted — ${rec.referenceNo}`;
      rec.responseJson = { result: 'OK', voucherId: `VCH-${id}-R${rec.attemptCount}` };
      if (!rec.externalRefId) {
        rec.externalRefId = `EXT-${id}`;
        registerExternalAccountingRef(rec.externalRefId);
      }
    } else if (finalStatus === 'ErrorSend') {
      rec.serviceOutput = 'Retry failed: ERP gateway timeout';
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
    rec.serviceOutput = 'Manually held — awaiting finance review';
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
    rec.serviceOutput = 'Integration canceled by operator';
    appendAudit(id, 'cancel', role, before, next, rec.correlationId);
    store[idx] = rec;
    return { ok: true, status: next };
  },
};

export function resetAccountingIntegrationsStoreForTest(): void {
  store = ACCOUNTING_INTEGRATIONS_SEED.map((r) => ({ ...r }));
  auditLog.clear();
  for (const [k, v] of Object.entries(ACCOUNTING_AUDIT_SEED)) {
    auditLog.set(k, [...v]);
  }
}

export function getTransactionLinkLabel(transactionId: string): string | undefined {
  const tx = TRANSACTIONS.find((t) => String(t.id) === transactionId);
  return tx ? tx.txNo : undefined;
}
