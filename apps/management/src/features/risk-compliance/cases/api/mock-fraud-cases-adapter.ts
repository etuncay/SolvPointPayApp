import { getCurrentUser, userNameById } from '@/features/approval-pool/domain/current-user';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import { fraudRulesService } from '@/features/risk-compliance/fraud-rules/api';
import type { FraudExceptionInput } from '@/features/risk-compliance/fraud-rules/detail/domain/types';
import { maskIban } from '@/mocks/transactions';
import { CUSTOMERS } from '@/mocks/data';
import { AGENTS } from '@/mocks/agents';
import { FRAUD_CASES } from '@/mocks/fraud-cases';
import { FRAUD_RULES } from '@/mocks/fraud-rules';
import { TRANSACTIONS } from '@/mocks/transactions';
import type { BackOfficeRole } from '@epay/ui';
import type { CompliancePersona } from '../detail/domain/compliance-persona';
import {
  statusAfterApprove,
  statusAfterReject,
  statusAfterRoute,
} from '../detail/domain/case-decisions';
import { getCaseDetailPermissions } from '../detail/domain/detail-permissions';
import type {
  CaseAction,
  CaseActionLogEntry,
  CaseActionResult,
  CaseDecisionInput,
  CaseRouteInput,
} from '../detail/domain/types';
import { validateDecisionComment, validateRouteInput } from '../detail/domain/validation';
import { buildCaseDetail } from '../detail/projection/case-detail-projection';
import {
  CLOSED_CASE_STATUSES,
  isOpenCase,
  OPEN_CASE_STATUSES,
} from '../domain/case-status-groups';
import { getFraudCasesPermissions } from '../domain/permissions';
import { sortFraudCases } from '../domain/sort-cases';
import type {
  CaseListFilters,
  FraudCaseHeader,
  FraudCaseListItem,
  FraudCaseRecord,
} from '../domain/types';
import type { FraudCaseAccessLogEntry, FraudCasesService } from './fraud-cases-service';

const NEW_CASE_HOURS = 24;
const SLA_WINDOW_HOURS = 24;

let store: FraudCaseRecord[] = FRAUD_CASES.map((c) => ({ ...c }));
let nextLogId = 1;
let accessLog: FraudCaseAccessLogEntry[] = [];
let caseActionLogs: Record<string, CaseActionLogEntry[]> = {};
let nextActionLogId = 1;

function now(): Date {
  return new Date('2026-05-24T12:00:00Z');
}

function appendLog(action: FraudCaseAccessLogEntry['action'], count?: number) {
  accessLog = [
    ...accessLog,
    { id: nextLogId++, action, count, at: now().toISOString() },
  ];
}

function customerName(id: number | null): string {
  if (id == null) return '—';
  return CUSTOMERS.find((c) => c.id === id)?.name ?? `#${id}`;
}

function agentNo(id: string | number | null): number | null {
  if (id == null) return null;
  const n = typeof id === 'number' ? id : Number(id);
  return Number.isFinite(n) ? n : null;
}

function toListItem(rec: FraudCaseRecord): FraudCaseListItem | null {
  const tx = TRANSACTIONS.find((t) => t.id === rec.transactionId && t.recordStatus === 1);
  if (!tx) return null;
  const rule = FRAUD_RULES.find((r) => r.id === rec.ruleId);
  let transactionNo = tx.txNo;
  if (rec.id === 'C-1001') transactionNo = 'TX-AML-001';

  const iban = tx.receiverIban ?? tx.senderIban;

  return {
    id: rec.id,
    transactionNo,
    transactionDate: tx.createdAt,
    priority: rec.priority,
    transactionType: tx.type,
    ruleTitle: rule?.title ?? rec.ruleId,
    riskScore: rec.riskScore,
    senderCustomerNo: tx.senderCustomerId,
    senderName: customerName(tx.senderCustomerId),
    receiverCustomerNo: tx.receiverCustomerId,
    receiverName: customerName(tx.receiverCustomerId),
    senderAgentNo: agentNo(tx.senderAgentId),
    receiverAgentNo: agentNo(tx.receiverAgentId),
    iban: iban ? maskIban(iban) : null,
    currency: tx.currency,
    amount: tx.amount,
    channel: rec.channel,
    transactionStatus: tx.status,
    caseStatus: rec.caseStatus,
    assignedUserName: rec.assignedUserId ? userNameById(rec.assignedUserId) : null,
    slaDueAt: rec.slaDueAt,
    createdAt: rec.createdAt,
  };
}

function applyFilters(rows: FraudCaseListItem[], filters: CaseListFilters): FraudCaseListItem[] {
  let out = rows;
  const showClosed = filters.showClosed || filters.quickFilter === 'closed';

  if (showClosed) {
    out = out.filter((r) => CLOSED_CASE_STATUSES.includes(r.caseStatus));
  } else {
    out = out.filter((r) => OPEN_CASE_STATUSES.includes(r.caseStatus));
  }

  if (filters.quickFilter === 'high_priority') {
    out = out.filter((r) => r.priority === 'High' || r.priority === 'Critical');
  }

  if (filters.quickFilter === 'new') {
    const cutoff = now().getTime() - NEW_CASE_HOURS * 3_600_000;
    out = out.filter(
      (r) =>
        r.caseStatus === 'Unassigned' ||
        new Date(r.createdAt).getTime() >= cutoff,
    );
  }

  if (filters.quickFilter === 'sla_due') {
    const limit = now().getTime() + SLA_WINDOW_HOURS * 3_600_000;
    out = out.filter((r) => {
      const due = new Date(r.slaDueAt).getTime();
      return due <= limit && isOpenCase(r.caseStatus);
    });
  }

  if (filters.quickFilter === 'assigned_me') {
    out = out.filter((r) => {
      const rec = store.find((c) => c.id === r.id);
      return rec?.assignedUserId === MOCK_USER_IDS.compliance;
    });
  }

  const q = filters.query.trim().toLowerCase();
  if (q) {
    out = out.filter(
      (r) =>
        r.transactionNo.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.senderName.toLowerCase().includes(q) ||
        r.receiverName.toLowerCase().includes(q) ||
        String(r.senderCustomerNo ?? '').includes(q),
    );
  }

  return out;
}

export const mockFraudCasesAdapter: FraudCasesService = {
  list(filters, role) {
    if (!getFraudCasesPermissions(role).list) return [];
    const rows = sortFraudCases(
      store.map(toListItem).filter((r): r is FraudCaseListItem => r != null),
    );
    const filtered = applyFilters(rows, filters);
    appendLog('list', filtered.length);
    return filtered;
  },

  exportRows(filters, role) {
    return this.list(filters, role);
  },

  getById(id, role) {
    if (!getFraudCasesPermissions(role).viewDetail) return null;
    const rec = store.find((c) => c.id === id);
    if (!rec) return null;
    const item = toListItem(rec);
    if (!item) return null;
    appendLog('detail');
    return {
      id: rec.id,
      transactionNo: item.transactionNo,
      caseStatus: rec.caseStatus,
      priority: rec.priority,
    };
  },

  countOpen(role) {
    if (!getFraudCasesPermissions(role).list) return 0;
    return store.filter((c) => isOpenCase(c.caseStatus)).length;
  },

  getDetail(id, role) {
    if (!getFraudCasesPermissions(role).viewDetail) return null;
    const rec = store.find((c) => c.id === id);
    if (!rec) return null;
    appendLog('detail');
    return buildCaseDetail(rec, caseActionLogs[id] ?? []);
  },

  approve(id, input, role, persona) {
    return runDecision(id, 'approve', input, role, persona, () => {
      const rec = store.find((c) => c.id === id)!;
      rec.caseStatus = statusAfterApprove();
    });
  },

  reject(id, input, role, persona) {
    return runDecision(id, 'reject', input, role, persona, () => {
      const rec = store.find((c) => c.id === id)!;
      rec.caseStatus = statusAfterReject();
    });
  },

  route(id, input, role, persona) {
    const guard = guardAction(id, 'route', role, persona);
    if (guard) return guard;
    const rec = store.find((c) => c.id === id);
    if (!rec) return { ok: false, error: 'fcd_not_found' };
    const detail = buildCaseDetail(rec, caseActionLogs[id] ?? []);
    if (!detail) return { ok: false, error: 'fcd_not_found' };
    const perms = getCaseDetailPermissions(persona, {
      isClosed: detail.header.isClosed,
      assignedToManager: detail.header.assignedToManager,
    });
    const v = validateRouteInput(input, perms.requireManagerNote);
    if (!v.ok) return { ok: false, error: v.error };
    rec.caseStatus = statusAfterRoute();
    rec.assignedUserId = input.targetUserId.trim();
    appendCaseAction(id, 'route', input, role);
    return { ok: true };
  },

  addException(id, input, role, persona) {
    const guard = guardAction(id, 'exception', role, persona);
    if (guard) return guard;
    const rec = store.find((c) => c.id === id);
    if (!rec) return { ok: false, error: 'fcd_not_found' };
    const r = fraudRulesService.addException(rec.ruleId, input, role);
    if (!r.ok) return { ok: false, error: r.error ?? 'fcd_action_failed' };
    appendCaseAction(id, 'exception', { comment: input.note }, role);
    return { ok: true };
  },

  report(id, input, role, persona) {
    return runDecision(id, 'report', input, role, persona, () => {
      /* SAR stub — yalnızca log */
    });
  },
};

function logsFor(caseId: string): CaseActionLogEntry[] {
  return caseActionLogs[caseId] ?? [];
}

function guardAction(
  caseId: string,
  action: CaseAction,
  role: BackOfficeRole,
  persona: CompliancePersona,
): CaseActionResult | null {
  if (!getFraudCasesPermissions(role).viewDetail) {
    return { ok: false, error: 'fcd_action_forbidden' };
  }
  const rec = store.find((c) => c.id === caseId);
  if (!rec) return { ok: false, error: 'fcd_not_found' };
  const detail = buildCaseDetail(rec, logsFor(caseId));
  if (!detail) return { ok: false, error: 'fcd_not_found' };
  const perms = getCaseDetailPermissions(persona, {
    isClosed: detail.header.isClosed,
    assignedToManager: detail.header.assignedToManager,
  });
  if (!perms.actionsEnabled) return { ok: false, error: 'fcd_case_closed' };
  const allowed =
    (action === 'approve' && perms.canApprove) ||
    (action === 'reject' && perms.canReject) ||
    (action === 'route' && perms.canRoute) ||
    (action === 'exception' && perms.canException) ||
    (action === 'report' && perms.canReport);
  if (!allowed) return { ok: false, error: 'fcd_action_forbidden' };
  return null;
}

function appendCaseAction(
  caseId: string,
  action: CaseAction,
  input: CaseDecisionInput,
  role: BackOfficeRole,
): void {
  const user = getCurrentUser(role);
  const entry: CaseActionLogEntry = {
    id: `CAL-${nextActionLogId++}`,
    caseId,
    action,
    comment: input.comment.trim(),
    managerNote: input.managerNote?.trim(),
    targetUserId: 'targetUserId' in input ? (input as CaseRouteInput).targetUserId : undefined,
    at: now().toISOString(),
    actorUserId: user.id,
    actorName: user.displayName,
  };
  caseActionLogs[caseId] = [...logsFor(caseId), entry];
}

function runDecision(
  caseId: string,
  action: CaseAction,
  input: CaseDecisionInput,
  role: BackOfficeRole,
  persona: CompliancePersona,
  apply: () => void,
): CaseActionResult {
  const guard = guardAction(caseId, action, role, persona);
  if (guard) return guard;
  const rec = store.find((c) => c.id === caseId);
  if (!rec) return { ok: false, error: 'fcd_not_found' };
  const detail = buildCaseDetail(rec, logsFor(caseId));
  if (!detail) return { ok: false, error: 'fcd_not_found' };
  const perms = getCaseDetailPermissions(persona, {
    isClosed: detail.header.isClosed,
    assignedToManager: detail.header.assignedToManager,
  });
  const v = validateDecisionComment(input, perms.requireManagerNote);
  if (!v.ok) return { ok: false, error: v.error };
  apply();
  appendCaseAction(caseId, action, input, role);
  return { ok: true };
}

const MANUAL_FRAUD_RULE_ID = 'FR-001';
let nextCaseSeq = 9000;

function hoursFromBase(h: number): string {
  return new Date(now().getTime() + h * 3_600_000).toISOString();
}

/** İşlem ile ilişkili vaka (açık/kapalı) */
export function findCaseByTransactionId(transactionId: number): FraudCaseRecord | null {
  return store.find((c) => c.transactionId === transactionId) ?? null;
}

/** Dolandırıcılık bildiriminden manuel vaka — Unassigned */
export function createCaseFromFraudReport(transactionId: number): FraudCaseRecord {
  const id = `C-${nextCaseSeq++}`;
  const at = now().toISOString();
  const rec: FraudCaseRecord = {
    id,
    transactionId,
    ruleId: MANUAL_FRAUD_RULE_ID,
    priority: 'High',
    riskScore: 55,
    caseStatus: 'Unassigned',
    assignedUserId: null,
    slaDueAt: hoursFromBase(72),
    createdAt: at,
    channel: 'Branch',
  };
  store.push(rec);
  appendLog('list');
  return rec;
}

export function __getFraudCasesStore(): FraudCaseRecord[] {
  return store;
}

export function __resetFraudCasesStoreForTest(): void {
  store = FRAUD_CASES.map((c) => ({ ...c }));
  accessLog = [];
  nextLogId = 1;
  nextCaseSeq = 9000;
  caseActionLogs = {};
  nextActionLogId = 1;
}

export function __getCaseActionLogs(caseId: string): CaseActionLogEntry[] {
  return caseActionLogs[caseId] ?? [];
}

export function __getFraudCasesAccessLog(): FraudCaseAccessLogEntry[] {
  return accessLog;
}
