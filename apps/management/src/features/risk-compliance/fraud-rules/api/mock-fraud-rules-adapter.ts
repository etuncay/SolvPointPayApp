import { FRAUD_RULES } from '@/mocks/fraud-rules';
import { FRAUD_RULE_VERSIONS } from '@/mocks/fraud-rule-versions';
import { FRAUD_RULE_EXCEPTIONS } from '@/mocks/fraud-rule-exceptions';
import { TRANSACTIONS } from '@/mocks/transactions';
import type { BackOfficeRole } from '@epay/ui';
import { validateFraudConditionDsl } from '../../shared/rule-dsl/parser';
import { getFraudRulesPermissions } from '../domain/permissions';
import type { FraudRuleFilters, FraudRuleListItem, FraudRuleRecord } from '../domain/types';
import { toListItem } from '../domain/types';
import { validateActionSet } from '../detail/domain/action-validation';
import { validateFraudRuleInput } from '../detail/domain/validation';
import {
  actionSummary,
  type FraudExceptionInput,
  type FraudRuleDetail,
  type FraudRuleInput,
  type FraudRuleSaveResult,
  type FraudRuleVersion,
  type FraudSimulationResult,
} from '../detail/domain/types';
import type { FraudRuleAccessLogEntry, FraudRulesService } from './fraud-rules-service';

let store: FraudRuleRecord[] = FRAUD_RULES.map((r) => ({
  ...r,
  actionDetails: r.actionDetails.map((a) => ({ ...a })),
}));
let versionStore: FraudRuleVersion[] = FRAUD_RULE_VERSIONS.map((v) => ({ ...v }));
let exceptionStore = FRAUD_RULE_EXCEPTIONS.map((e) => ({ ...e }));
let nextRuleNum = 16;
let nextVersionId = 100;
let nextExceptionId = 100;
let nextLogId = 1;
let accessLog: FraudRuleAccessLogEntry[] = [];

const CURRENT_USER = 'current.user';

function nowIso(): string {
  return new Date().toISOString();
}

function appendAccessLog(action: FraudRuleAccessLogEntry['action'], count?: number) {
  accessLog = [...accessLog, { id: nextLogId++, action, count, at: nowIso(), by: CURRENT_USER }];
}

function canEdit(role: BackOfficeRole): boolean {
  return getFraudRulesPermissions(role).view;
}

function applyFilters(rows: FraudRuleListItem[], filters: FraudRuleFilters): FraudRuleListItem[] {
  let out = rows;
  const q = filters.query.trim().toLowerCase();
  if (q) {
    out = out.filter(
      (r) => r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q),
    );
  }
  if (filters.scope !== 'all') out = out.filter((r) => r.scope === filters.scope);
  if (filters.status !== 'all') out = out.filter((r) => r.status === filters.status);
  return out;
}

function listProjection(role: BackOfficeRole): FraudRuleListItem[] {
  if (!getFraudRulesPermissions(role).list) return [];
  return store
    .filter((r) => r.recordStatus === 1)
    .map(toListItem)
    .sort((a, b) => a.triggerOrder - b.triggerOrder);
}

function findRule(id: string): FraudRuleRecord | undefined {
  return store.find((r) => r.id === id && r.recordStatus === 1);
}

function appendVersion(rule: FraudRuleRecord, description?: string): void {
  const existing = versionStore.filter((v) => v.ruleId === rule.id);
  const versionNo = existing.length + 1;
  const at = nowIso();
  versionStore.push({
    id: `FRV-${nextVersionId++}`,
    ruleId: rule.id,
    versionNo,
    createdAt: at,
    updatedAt: at,
    conditionDsl: rule.conditionDsl,
    actionSummary: actionSummary(rule.actionDetails),
    description: description ?? rule.description,
  });
}

function inputToRecord(
  input: FraudRuleInput,
  id: string,
  triggerOrder: number,
  metrics?: Partial<FraudRuleRecord>,
): FraudRuleRecord {
  const at = nowIso();
  return {
    id,
    triggerOrder,
    title: input.title.trim(),
    description: input.description.trim(),
    scope: input.scope,
    status: input.status,
    priority: input.priority,
    conditionDsl: input.conditionDsl.trim(),
    regulationReference: input.regulationReference.trim(),
    actionDetails: input.actionDetails.map((a) => ({
      type: a.type,
      params: a.params ? { ...a.params } : undefined,
    })),
    dslValidatedAt: input.dslValidatedAt,
    createdAt: metrics?.createdAt ?? at,
    updatedAt: at,
    recordStatus: 1,
    truePositive: metrics?.truePositive ?? 0,
    falsePositive: metrics?.falsePositive ?? 0,
    casesOpened: metrics?.casesOpened ?? 0,
    avgCaseReviewMinutes: metrics?.avgCaseReviewMinutes ?? 0,
  };
}

function validateSaveInput(input: FraudRuleInput): FraudRuleSaveResult {
  const form = validateFraudRuleInput(input);
  if (!form.ok) return form;
  const dsl = validateFraudConditionDsl(input.conditionDsl, input.scope);
  if (!dsl.ok) return { ok: false, error: dsl.errors[0] ?? 'frd_dsl_invalid' };
  const actions = validateActionSet(input.actionDetails);
  if (!actions.ok) return actions;
  return { ok: true };
}

function simulateMetrics(rule: FraudRuleRecord | FraudRuleInput): FraudSimulationResult {
  const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
  const txs = TRANSACTIONS.filter((t) => {
    if (t.recordStatus !== 1) return false;
    const ts = new Date(t.createdAt.replace(' ', 'T')).getTime();
    return ts >= sixMonthsAgo;
  });
  const total = txs.length;
  const rate = rule.priority === 'Critical' ? 0.08 : rule.priority === 'High' ? 0.05 : 0.03;
  const blocked = Math.min(total, Math.floor(total * rate));
  const cases = Math.floor(blocked * 0.7);
  const tp = Math.floor(cases * 0.55);
  const fp = cases - tp;
  return {
    totalTransactions: total,
    blockedCount: blocked,
    casesOpened: cases,
    truePositive: tp,
    falsePositive: fp,
    trueNegative: total - blocked - fp,
    falseNegative: blocked - cases,
  };
}

export const mockFraudRulesAdapter: FraudRulesService = {
  list(filters, role) {
    const rows = applyFilters(listProjection(role), filters);
    appendAccessLog('list', rows.length);
    return rows;
  },

  exportRows(filters, role) {
    const rows = applyFilters(listProjection(role), filters);
    appendAccessLog('export', rows.length);
    return rows;
  },

  getDetail(id, role) {
    if (!canEdit(role)) return null;
    const rule = findRule(id);
    if (!rule) return null;
    appendAccessLog('detail');
    const versions = versionStore
      .filter((v) => v.ruleId === id)
      .sort((a, b) => b.versionNo - a.versionNo);
    const exceptions = exceptionStore
      .filter((e) => e.ruleId === id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { rule: { ...rule, actionDetails: rule.actionDetails.map((a) => ({ ...a })) }, versions, exceptions };
  },

  create(input, role) {
    if (!canEdit(role)) return { ok: false, error: 'frd_forbidden' };
    const v = validateSaveInput(input);
    if (!v.ok) return v;
    const maxOrder = store.filter((r) => r.recordStatus === 1).reduce((m, r) => Math.max(m, r.triggerOrder), 0);
    const id = `FR-${String(nextRuleNum++).padStart(3, '0')}`;
    const rec = inputToRecord(input, id, maxOrder + 1);
    store.push(rec);
    appendVersion(rec, 'İlk versiyon');
    appendAccessLog('create');
    return { ok: true, id };
  },

  update(id, input, role) {
    if (!canEdit(role)) return { ok: false, error: 'frd_forbidden' };
    const existing = findRule(id);
    if (!existing) return { ok: false, error: 'frd_not_found' };
    const v = validateSaveInput(input);
    if (!v.ok) return v;
    const rec = inputToRecord(input, id, existing.triggerOrder, existing);
    store = store.map((r) => (r.id === id ? rec : r));
    appendVersion(rec);
    appendAccessLog('update');
    return { ok: true, id };
  },

  toggle(id, role) {
    if (!canEdit(role)) return { ok: false, error: 'frd_forbidden' };
    const existing = findRule(id);
    if (!existing) return { ok: false, error: 'frd_not_found' };
    const nextStatus = existing.status === 'Active' ? 'Passive' : 'Active';
    store = store.map((r) =>
      r.id === id ? { ...r, status: nextStatus, updatedAt: nowIso() } : r,
    );
    appendAccessLog('toggle');
    return { ok: true, id };
  },

  validateDsl(dsl, scope) {
    return validateFraudConditionDsl(dsl, scope);
  },

  simulate(id, draft, role) {
    if (!canEdit(role)) return null;
    appendAccessLog('simulate');
    if (draft) return simulateMetrics(draft);
    if (id) {
      const rule = findRule(id);
      if (!rule) return null;
      return simulateMetrics(rule);
    }
    return null;
  },

  addException(id, input, role) {
    if (!canEdit(role)) return { ok: false, error: 'frd_forbidden' };
    if (!findRule(id)) return { ok: false, error: 'frd_not_found' };
    if (!input.customerNo.trim()) return { ok: false, error: 'frd_exception_customer' };
    if (!input.expiresAt) return { ok: false, error: 'frd_exception_expires' };
    exceptionStore.push({
      id: `FRE-${nextExceptionId++}`,
      ruleId: id,
      customerNo: input.customerNo.trim(),
      expiresAt: input.expiresAt,
      note: input.note.trim(),
      createdAt: nowIso(),
    });
    appendAccessLog('exception');
    return { ok: true, id };
  },
};

export function __resetFraudRulesStoreForTest(): void {
  store = FRAUD_RULES.map((r) => ({
    ...r,
    actionDetails: r.actionDetails.map((a) => ({ ...a })),
  }));
  versionStore = FRAUD_RULE_VERSIONS.map((v) => ({ ...v }));
  exceptionStore = FRAUD_RULE_EXCEPTIONS.map((e) => ({ ...e }));
  nextRuleNum = 16;
  nextVersionId = 100;
  nextExceptionId = 100;
  accessLog = [];
  nextLogId = 1;
}

export function __getFraudRulesAccessLog(): FraudRuleAccessLogEntry[] {
  return accessLog;
}

/** Geriye uyum — liste testleri */
export function __getRuleById(id: string): FraudRuleRecord | null {
  return findRule(id) ?? null;
}
