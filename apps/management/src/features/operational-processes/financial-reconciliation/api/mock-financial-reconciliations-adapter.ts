import { getLiveBalanceSources } from '@/mocks/financial-balance-sources';
import { FINANCIAL_RECONCILIATIONS_SEED } from '@/mocks/financial-reconciliations';
import type { BackOfficeRole } from '@epay/ui';
import { getActiveParameterValue } from '@/mocks/system-parameters';
import { applyFinancialReconciliationFilters } from '../domain/apply-filters';
import { buildFinancialReconciliationSnapshot } from '../domain/compute-snapshot';
import { getFinancialReconciliationPermissions } from '../domain/permissions';
import type {
  FinancialReconciliation,
  FinancialReconciliationAdjustResult,
  FinancialReconciliationFilters,
  FinancialReconciliationRunResult,
} from '../domain/types';
import { canAdjustStatus, validateAdjustDescription } from '../domain/validation';
import type { FinancialReconciliationsService } from './financial-reconciliations-service';

let store: FinancialReconciliation[] = FINANCIAL_RECONCILIATIONS_SEED.map((r) => ({ ...r }));
let nextSeq = 5;

function nowCreated(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function nextId(): string {
  const id = `FR-${String(nextSeq).padStart(3, '0')}`;
  nextSeq += 1;
  return id;
}

export const mockFinancialReconciliationsAdapter: FinancialReconciliationsService = {
  list(filters, role) {
    const p = getFinancialReconciliationPermissions(role);
    if (!p.list) return [];
    return applyFinancialReconciliationFilters([...store], filters).sort((a, b) =>
      b.asOfTimestamp.localeCompare(a.asOfTimestamp),
    );
  },

  run(role, asOf) {
    const p = getFinancialReconciliationPermissions(role);
    if (!p.run) return { ok: false, error: 'br_run_forbidden' };

    const cutOff = asOf ?? new Date();
    const sources = getLiveBalanceSources({ injectMismatch: true });
    if (!sources) return { ok: false, error: 'finrec_snapshot_failed' };

    const tolerance = getActiveParameterValue('reconciliation.amount_tolerance_try', 0.01);
    const partial = buildFinancialReconciliationSnapshot(cutOff, sources, tolerance);
    const row: FinancialReconciliation = {
      ...partial,
      id: nextId(),
      description: null,
      createdAt: nowCreated(),
    };
    store = [row, ...store];
    return { ok: true, row };
  },

  adjust(id, description, role) {
    const p = getFinancialReconciliationPermissions(role);
    if (!p.adjust) return { ok: false, error: 'finrec_adjust_forbidden' };

    const descErr = validateAdjustDescription(description);
    if (descErr) return { ok: false, error: descErr };

    const existing = store.find((r) => r.id === id);
    if (!existing) return { ok: false, error: 'finrec_not_found' };
    if (!canAdjustStatus(existing.status)) return { ok: false, error: 'finrec_invalid_status' };

    const row: FinancialReconciliation = {
      ...existing,
      status: 'Adjusted',
      description: description.trim(),
    };
    store = store.map((r) => (r.id === id ? row : r));
    return { ok: true, row };
  },

  resetForTests() {
    store = FINANCIAL_RECONCILIATIONS_SEED.map((r) => ({ ...r }));
    nextSeq = 5;
  },
};

export function getFinancialReconciliationsStoreSnapshot(): FinancialReconciliation[] {
  return store.map((r) => ({ ...r }));
}
