import { CUSTOMERS } from '@/mocks/data';
import { AGENTS } from '@/mocks/agents';
import { TRANSACTIONS } from '@/mocks/transactions';
import { RISK_ACTION_SETS } from '@/mocks/risk-action-sets';
import { RISK_SCORE_RULES } from '@/mocks/risk-score-rules';
import { computeWeightedScore } from '../../shared/compute-score';
import { hasActionConflict } from '../../shared/fraud-actions';
import { classifyRiskLevel } from '../../shared/risk-classification';
import { validateConditionDsl } from '../../shared/rule-dsl/parser';
import type { RiskScoreScope } from '../../shared/rule-dsl/variables';
import type { RiskLevel } from '../../shared/risk-classification';
import { parseRiskScoreRuleInput } from '../domain/validation';
import type {
  RiskActionSet,
  RiskScoreRule,
  RiskScoreRuleAuditEntry,
  RiskScoreRuleInput,
  RiskScoreRuleUpdateInput,
  SimulationResult,
  SimulationTransition,
} from '../domain/types';
import type { RiskScoreRulesPort } from './risk-score-rules-service';

let rulesStore: RiskScoreRule[] = RISK_SCORE_RULES.map((r) => ({ ...r }));
let actionStore: RiskActionSet[] = RISK_ACTION_SETS.map((s) => ({ ...s, actions: [...s.actions] }));
let nextRuleSeq = 100;
let nextAuditId = 1;
let auditLog: RiskScoreRuleAuditEntry[] = [];

function nowIso() {
  return new Date().toISOString();
}

function appendAudit(
  action: RiskScoreRuleAuditEntry['action'],
  scope: RiskScoreScope,
  ruleId?: string,
) {
  auditLog = [
    ...auditLog,
    { id: nextAuditId++, action, ruleId, scope, at: nowIso(), by: 'current.user' },
  ];
}

function sortRules(rows: RiskScoreRule[]): RiskScoreRule[] {
  return [...rows].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'Active' ? -1 : 1;
    return a.title.localeCompare(b.title, 'tr');
  });
}

function rulesForScope(scope: RiskScoreScope, draft?: RiskScoreRule[]): RiskScoreRule[] {
  const source = draft ?? rulesStore;
  return source.filter((r) => r.scope === scope && r.recordStatus === 1);
}

function buildCustomerCtx(c: (typeof CUSTOMERS)[number], i: number): Record<string, unknown> {
  return {
    riskScore: c.riskScore,
    kycLevel: c.kyc,
    pepFlag: i % 17 === 0,
    monthlyVolume: 100_000 + (i % 20) * 50_000,
    country: 'TR',
    status: c.status,
  };
}

function buildAgentCtx(a: (typeof AGENTS)[0]): Record<string, unknown> {
  return {
    dailyVolume: a.balance.TRY,
    anomalyScore: a.status === 'blocked' ? 85 : 30,
    branchCount: a.branches,
    status: a.status,
    txToday: a.txToday,
  };
}

function buildTxCtx(tx: (typeof TRANSACTIONS)[0]): Record<string, unknown> {
  const hour = new Date(tx.createdAt).getHours();
  return {
    amount: tx.amount,
    country: tx.currency === 'TRY' ? 'TR' : 'US',
    isForeign: tx.currency !== 'TRY',
    channel: tx.type,
    hour,
    currency: tx.currency,
  };
}

function sixMonthsAgo(): number {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.getTime();
}

function runSimulation(scope: RiskScoreScope, draft?: RiskScoreRule[]): SimulationResult {
  const current = rulesForScope(scope);
  const next = draft ? rulesForScope(scope, draft) : current;
  const matrix = new Map<string, number>();

  const bump = (from: RiskLevel, to: RiskLevel) => {
    if (from === to) return;
    const key = `${from}|${to}`;
    matrix.set(key, (matrix.get(key) ?? 0) + 1);
  };

  if (scope === 'Customer') {
    CUSTOMERS.forEach((c, i) => {
      const ctx = buildCustomerCtx(c, i);
      const from = classifyRiskLevel(computeWeightedScore(current, ctx, scope));
      const to = classifyRiskLevel(computeWeightedScore(next, ctx, scope));
      bump(from, to);
    });
  } else if (scope === 'Agent') {
    AGENTS.forEach((a) => {
      const ctx = buildAgentCtx(a);
      const from = classifyRiskLevel(computeWeightedScore(current, ctx, scope));
      const to = classifyRiskLevel(computeWeightedScore(next, ctx, scope));
      bump(from, to);
    });
  } else {
    const cutoff = sixMonthsAgo();
    TRANSACTIONS.filter((tx) => new Date(tx.createdAt).getTime() >= cutoff).forEach((tx) => {
      const ctx = buildTxCtx(tx);
      const from = classifyRiskLevel(computeWeightedScore(current, ctx, scope));
      const to = classifyRiskLevel(computeWeightedScore(next, ctx, scope));
      bump(from, to);
    });
  }

  const transitions: SimulationTransition[] = [];
  for (const [key, count] of matrix) {
    const [fromLevel, toLevel] = key.split('|') as [RiskLevel, RiskLevel];
    transitions.push({ fromLevel, toLevel, count });
  }
  transitions.sort((a, b) => b.count - a.count);

  return {
    scope,
    transitions,
    totalAffected: transitions.reduce((s, t) => s + t.count, 0),
  };
}

export const mockRiskScoreRulesAdapter: RiskScoreRulesPort = {
  list(scope) {
    return sortRules(rulesStore.filter((r) => r.scope === scope && r.recordStatus === 1));
  },

  create(scope, input) {
    const parsed = parseRiskScoreRuleInput(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? 'rs_validation_failed');
    }
    if (!input.validatedAt) throw new Error('rs_not_validated');
    const dsl = validateConditionDsl(parsed.data.conditionDsl, scope);
    if (!dsl.ok) throw new Error(dsl.errors[0] ?? 'rs_dsl_invalid');

    const ts = nowIso();
    const row: RiskScoreRule = {
      id: `RSR-${scope[0]}${nextRuleSeq++}`,
      scope,
      title: parsed.data.title,
      conditionDsl: parsed.data.conditionDsl,
      scoreContribution: parsed.data.scoreContribution,
      weight: 1,
      description: parsed.data.description ?? null,
      status: 'Active',
      validatedAt: input.validatedAt,
      recordStatus: 1,
      createdAt: ts,
      createdBy: 'current.user',
      updatedAt: ts,
      updatedBy: 'current.user',
    };
    rulesStore = [...rulesStore, row];
    appendAudit('create', scope, row.id);
    return row;
  },

  update(id, input) {
    const idx = rulesStore.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error('rs_not_found');
    const prev = rulesStore[idx]!;
    if (prev.status === 'Passive' && input.conditionDsl) {
      throw new Error('rs_passive_readonly');
    }
    const merged = {
      title: input.title ?? prev.title,
      conditionDsl: input.conditionDsl ?? prev.conditionDsl,
      scoreContribution: input.scoreContribution ?? prev.scoreContribution,
      description: input.description !== undefined ? input.description : prev.description,
      validatedAt: input.validatedAt ?? prev.validatedAt,
    };
    const parsed = parseRiskScoreRuleInput(merged);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'rs_validation_failed');
    if (!merged.validatedAt) throw new Error('rs_not_validated');
    const dsl = validateConditionDsl(merged.conditionDsl, prev.scope);
    if (!dsl.ok) throw new Error(dsl.errors[0] ?? 'rs_dsl_invalid');

    const next: RiskScoreRule = {
      ...prev,
      ...merged,
      updatedAt: nowIso(),
      updatedBy: 'current.user',
    };
    rulesStore = rulesStore.map((r, i) => (i === idx ? next : r));
    appendAudit('update', prev.scope, id);
    return next;
  },

  toggle(id) {
    const idx = rulesStore.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error('rs_not_found');
    const prev = rulesStore[idx]!;
    const next: RiskScoreRule = {
      ...prev,
      status: prev.status === 'Active' ? 'Passive' : 'Active',
      updatedAt: nowIso(),
      updatedBy: 'current.user',
    };
    rulesStore = rulesStore.map((r, i) => (i === idx ? next : r));
    appendAudit('toggle', prev.scope, id);
    return next;
  },

  validate(dsl, scope) {
    return validateConditionDsl(dsl, scope);
  },

  simulate(scope, draftRules) {
    return runSimulation(scope, draftRules);
  },

  getActionSets(scope) {
    return actionStore
      .filter((s) => s.scope === scope)
      .map((s) => ({ ...s, actions: [...s.actions] }));
  },

  saveActionSets(scope, sets) {
    for (const s of sets) {
      if (hasActionConflict(s.actions)) throw new Error('rs_action_conflict');
    }
    actionStore = [
      ...actionStore.filter((s) => s.scope !== scope),
      ...sets.map((s) => ({ ...s, scope, actions: [...s.actions] })),
    ];
    appendAudit('save_actions', scope);
    return this.getActionSets(scope);
  },

  getAuditLog() {
    return [...auditLog];
  },

  resetForTests() {
    rulesStore = RISK_SCORE_RULES.map((r) => ({ ...r }));
    actionStore = RISK_ACTION_SETS.map((s) => ({ ...s, actions: [...s.actions] }));
    nextRuleSeq = 100;
    nextAuditId = 1;
    auditLog = [];
  },
};
