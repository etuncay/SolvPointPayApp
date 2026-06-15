import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import { isOpenCaseStatus } from '@/features/support/domain/case-status-ui';
import { BANK_RECONCILIATIONS_SEED } from '@/mocks/bank-reconciliations';
import {
  getSupportCaseById,
  resetSupportCasesStore,
  type SupportCase,
} from '@/mocks/support-cases';
import { TRANSACTIONS } from '@/mocks/transactions';
import type { BackOfficeRole } from '@epay/ui';
import { bankMovementsService } from '@/features/banks/movements/api';
import type { FeeCurrency } from '@/features/customer-fees/domain/types';
import { applyBankReconciliationFilters } from '../domain/apply-bank-reconciliation-filters';
import { closeReconciliationFromCase, ensureReconciliationCase } from '../domain/case-bridge';
import { matchFirmToBank, type MatchLine } from '../domain/match-rules';
import { getBankReconciliationPermissions } from '../domain/permissions';
import { getReconParams } from '../domain/tolerance-config';
import type {
  BankReconciliation,
  BankReconciliationCloseResult,
  BankReconciliationFilters,
  BankReconciliationRunResult,
} from '../domain/types';
import type {
  BankReconciliationChangeLogEntry,
  BankReconciliationsService,
} from './bank-reconciliations-service';

const BANK_RELATED_TYPES = new Set([
  'WalletToBankAccount',
  'InternationalTransfer',
  'InternalTransfer',
]);

let store: BankReconciliation[] = BANK_RECONCILIATIONS_SEED.map((r) => ({ ...r }));
let nextId = 1000;
let nextLogId = 1;
let changeLog: BankReconciliationChangeLogEntry[] = [];

/** Mutabakat seed (id 2, 3) ile hizalı destek talepleri */
const INITIAL_CASES: SupportCase[] = [
  {
    id: 1,
    caseNo: 'SC-6001',
    subject: 'Mutabakat uyuşmazlığı — REF-INGEST-DUP',
    complaintType: 'ReconciliationDiscrepancy',
    requesterType: 'Customer',
    requesterId: '—',
    detail: 'Seed açık talep',
    ownerUserId: MOCK_USER_IDS.finance,
    departmentId: 'finance',
    urgency: 'High',
    criticality: 'High',
    caseStatus: 'Assigned',
    lastAction: 'Assignment',
    reconciliationId: 2,
    source: 'reconciliation',
    createdAt: '2026-05-19T09:20:00Z',
    updatedAt: '2026-05-19T09:20:00Z',
    closedAt: null,
    notesText: 'Seed açık talep',
    actionLog: [],
    documentIds: [],
  },
  {
    id: 2,
    caseNo: 'SC-6002',
    subject: 'Mutabakat uyuşmazlığı — REF-2026-1800',
    complaintType: 'ReconciliationDiscrepancy',
    requesterType: 'Customer',
    requesterId: '—',
    detail: 'Kapatıldı',
    ownerUserId: MOCK_USER_IDS.finance,
    departmentId: 'finance',
    urgency: 'Medium',
    criticality: 'Medium',
    caseStatus: 'Resolved_IssueFixed',
    lastAction: 'CaseClosed',
    reconciliationId: 3,
    source: 'reconciliation',
    createdAt: '2026-05-12T10:05:00Z',
    updatedAt: '2026-05-12T11:00:00Z',
    closedAt: '2026-05-12T11:00:00Z',
    notesText: 'Kapatıldı',
    actionLog: [],
    documentIds: [],
  },
];

function nowTs(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function appendLog(
  action: BankReconciliationChangeLogEntry['action'],
  entityId?: number,
  detail?: unknown,
) {
  changeLog = [
    ...changeLog,
    { id: nextLogId++, action, entityId, detail, at: nowTs(), by: 'current.user' },
  ];
}

function enrichRow(row: BankReconciliation): BankReconciliation {
  if (!row.caseId) return { ...row, caseNo: null };
  const c = getSupportCaseById(row.caseId);
  return { ...row, caseNo: c?.caseNo ?? row.caseNo };
}

function canAccess(role: BackOfficeRole): boolean {
  return getBankReconciliationPermissions(role).list;
}

function filtered(filters: BankReconciliationFilters, role: BackOfficeRole): BankReconciliation[] {
  if (!canAccess(role)) return [];
  const sorted = [...store]
    .filter((r) => r.recordStatus === 1)
    .map(enrichRow)
    .sort((a, b) => b.reconciliationDate.localeCompare(a.reconciliationDate));
  return applyBankReconciliationFilters(sorted, filters);
}

function buildFirmLines(): Array<MatchLine & { transactionType: string; firmSourceId: string }> {
  return TRANSACTIONS.filter(
    (tx) => tx.recordStatus === 1 && tx.status === 'Completed' && BANK_RELATED_TYPES.has(tx.type),
  ).map((tx) => ({
    referenceNo: tx.referenceNo,
    bankTransactionNo: tx.txNo,
    amount: tx.amount,
    currency: tx.currency as FeeCurrency,
    transactionDate: tx.createdAt,
    bank: 'Ziraat Bankası',
    transactionType: tx.type,
    firmSourceId: `tx-${tx.id}`,
  }));
}

function buildBankLines(): MatchLine[] {
  return bankMovementsService
    .list(
      {
        query: '',
        paymentStatus: 'Completed',
        bankTransferMethod: 'all',
        currency: 'all',
        amountMin: '',
        amountMax: '',
        transactionFrom: '',
        transactionTo: '',
      },
      'finance',
    )
    .map((m) => ({
      referenceNo: m.referenceNo,
      bankTransactionNo: m.bankTransactionNo,
      amount: m.amount,
      currency: m.currency,
      transactionDate: m.transactionDate,
      bank: m.sourceBank,
    }));
}

function upsertFromRun(
  firm: MatchLine & { transactionType: string; firmSourceId: string },
  movements: MatchLine[],
  params: ReturnType<typeof getReconParams>,
): BankReconciliation {
  const outcome = matchFirmToBank(firm, movements, params);
  const existing = store.find((r) => r.firmSourceId === firm.firmSourceId && r.recordStatus === 1);
  const reconciliationDate = nowTs();

  let row: BankReconciliation = {
    id: existing?.id ?? nextId++,
    bank: outcome.bank || firm.bank,
    transactionDate: firm.transactionDate,
    transactionType: firm.transactionType,
    referenceNo: firm.referenceNo,
    amount: firm.amount,
    bankCurrency: outcome.bankCurrency,
    bankAmount: outcome.bankAmount,
    reconciliationDate,
    status: existing?.status === 'Adjusted' ? 'Adjusted' : outcome.status,
    caseId: existing?.caseId ?? null,
    caseNo: existing?.caseNo ?? null,
    firmSourceId: firm.firmSourceId,
    recordStatus: 1,
  };

  if (row.status === 'Adjusted') {
    return row;
  }

  row.status = outcome.status;

  if (row.status === 'Unmatched') {
    const support = ensureReconciliationCase(row);
    row = { ...row, caseId: support.caseId, caseNo: support.caseNo };
  }

  if (existing) {
    store = store.map((r) => (r.id === existing.id ? row : r));
  } else {
    store = [...store, row];
  }

  return row;
}

export const mockBankReconciliationsAdapter: BankReconciliationsService = {
  list(filters, role) {
    const rows = filtered(filters, role);
    appendLog('list', undefined, { count: rows.length });
    return rows;
  },

  run(role) {
    if (!getBankReconciliationPermissions(role).run) {
      return { ok: false, error: 'br_run_forbidden' };
    }

    const params = getReconParams();
    const movements = buildBankLines();
    const firms = buildFirmLines();

    let matched = 0;
    let unmatched = 0;
    let casesCreated = 0;

    for (const firm of firms) {
      const existing = store.find((r) => r.firmSourceId === firm.firmSourceId && r.recordStatus === 1);
      const supportCase =
        existing?.caseId != null ? getSupportCaseById(existing.caseId) : null;
      const hadOpenCase =
        supportCase != null && isOpenCaseStatus(supportCase.caseStatus);
      const row = upsertFromRun(firm, movements, params);
      if (row.status === 'Matched') matched++;
      if (row.status === 'Unmatched') {
        unmatched++;
        if (row.caseId != null && !hadOpenCase) {
          const c = getSupportCaseById(row.caseId);
          if (c && c.actionLog.some((l) => l.note.startsWith('Otomatik'))) casesCreated++;
        }
      }
    }

    const result: BankReconciliationRunResult = {
      ok: true,
      matched,
      unmatched,
      casesCreated,
      rowsProcessed: firms.length,
    };
    appendLog('run', undefined, result);
    return result;
  },

  closeFromCase(reconciliationId, role) {
    if (!getBankReconciliationPermissions(role).run) {
      return { ok: false, error: 'br_close_forbidden' };
    }

    const existing = store.find((r) => r.id === reconciliationId && r.recordStatus === 1);
    if (!existing) return { ok: false, error: 'br_not_found' };

    const closed = closeReconciliationFromCase(existing);
    const row: BankReconciliation = {
      ...existing,
      status: 'Adjusted',
      reconciliationDate: nowTs(),
    };
    store = store.map((r) => (r.id === reconciliationId ? row : r));
    appendLog('closeFromCase', reconciliationId, closed);
    return { ok: true, alreadyAdjusted: closed.alreadyAdjusted };
  },

  getChangeLog() {
    return [...changeLog];
  },
};

export function resetBankReconciliationsStore() {
  store = BANK_RECONCILIATIONS_SEED.map((r) => ({ ...r }));
  nextId = 1000;
  nextLogId = 1;
  changeLog = [];
  resetSupportCasesStore(INITIAL_CASES);
}

resetSupportCasesStore(INITIAL_CASES);

export function getBankReconciliationsStoreSnapshot(): BankReconciliation[] {
  return store.map((r) => ({ ...r }));
}
