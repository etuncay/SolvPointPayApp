import { RISK_SCORE_RULES } from '@/mocks/risk-score-rules';
import { RISK_SCORE_HISTORY } from '@/mocks/risk-score-history';
import { RISK_SCORE_RECORDS } from '@/mocks/risk-scores';
import type { BackOfficeRole } from '@epay/ui';
import { approvalsService } from '@/features/approval-pool/api';
import { classifyRiskLevel } from '../../shared/risk-classification';
import { resolveEntity } from '../domain/entity-resolver';
import { getRiskScoresPermissions } from '../domain/permissions';
import { validateManualChange } from '../domain/validation';
import type {
  FraudRiskSource,
  ManualChangeInput,
  RiskScoreDetail,
  RiskScoreRecord,
  ScoreBreakdownItem,
  ScoreHistoryEntry,
} from '../domain/types';
import { entityKey } from '../domain/types';
import {
  createRiskScoreApprovalRequest,
  parseRiskScoreApprovalMeta,
  registerRiskScoreApprovalApply,
} from './approval-bridge';
import type { RiskScoresService } from './risk-scores-service';

let recordStore: RiskScoreRecord[] = RISK_SCORE_RECORDS.map((r) => ({ ...r }));
let historyStore: ScoreHistoryEntry[] = RISK_SCORE_HISTORY.map((h) => ({ ...h }));
let nextHistId = 10_000;

function nowIso(): string {
  return new Date().toISOString();
}

function findRecord(key: string): RiskScoreRecord | undefined {
  return recordStore.find((r) => r.entityKey === key);
}

function ensureRecord(source: FraudRiskSource, entityId: string): RiskScoreRecord | null {
  const key = entityKey(source, entityId);
  const existing = findRecord(key);
  if (existing) return existing;

  const resolved = resolveEntity(source, entityId);
  if (!resolved) return null;

  const score = resolved.bootstrapScore ?? 30;
  const rec: RiskScoreRecord = {
    entityKey: key,
    source,
    entityId: entityId.trim(),
    displayName: resolved.displayName,
    score,
    level: classifyRiskLevel(score),
    calculatedAt: nowIso(),
  };
  recordStore.push(rec);
  return rec;
}

function scopeForSource(source: FraudRiskSource): 'Customer' | 'Agent' | 'Transaction' {
  return source;
}

function buildBreakdown(source: FraudRiskSource, score: number): ScoreBreakdownItem[] {
  const scope = scopeForSource(source);
  const active = RISK_SCORE_RULES.filter((r) => r.scope === scope && r.status === 'Active');
  const triggered = active.slice(0, Math.min(3, active.length));
  if (triggered.length === 0) {
    return [{ ruleId: 'BASE', title: 'Temel skor', scoreContribution: score }];
  }
  return triggered.map((r) => ({
    ruleId: r.id,
    title: r.title,
    scoreContribution: r.scoreContribution,
  }));
}

function historyFor(key: string): ScoreHistoryEntry[] {
  return [...historyStore]
    .filter((h) => h.entityKey === key)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

function pendingFor(rec: RiskScoreRecord): { id: number; ref: string } | null {
  if (!rec.pendingApprovalId) return null;
  const ap = approvalsService.getById(rec.pendingApprovalId);
  if (!ap || !['awaiting_first', 'awaiting_second'].includes(ap.uiStatus)) {
    return null;
  }
  return { id: ap.id, ref: ap.referenceNo };
}

function toDetail(rec: RiskScoreRecord): RiskScoreDetail {
  const pending = pendingFor(rec);
  return {
    source: rec.source,
    entityId: rec.entityId,
    displayName: rec.displayName,
    score: rec.score,
    level: rec.level,
    calculatedAt: rec.calculatedAt,
    breakdown: buildBreakdown(rec.source, rec.score),
    history: historyFor(rec.entityKey),
    pendingApprovalId: pending?.id ?? null,
    pendingApprovalRef: pending?.ref ?? null,
    manualOverrideUntilRecalc: Boolean(rec.manualOverrideUntilRecalc),
  };
}

function applyApprovedScore(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  const meta = parseRiskScoreApprovalMeta(approval);
  if (!meta) return;

  const rec = findRecord(meta.entityKey);
  if (!rec) return;

  const at = nowIso();
  const level = classifyRiskLevel(meta.newScore);
  recordStore = recordStore.map((r) =>
    r.entityKey === meta.entityKey
      ? {
          ...r,
          score: meta.newScore,
          level,
          calculatedAt: at,
          manualOverrideUntilRecalc: true,
          pendingApprovalId: null,
        }
      : r,
  );

  historyStore.push({
    id: `H-${nextHistId++}`,
    entityKey: meta.entityKey,
    at,
    score: meta.newScore,
    category: level,
    changeType: 'manual',
  });
}

registerRiskScoreApprovalApply((approvalId) => {
  applyApprovedScore(approvalId);
});

export const mockRiskScoresAdapter: RiskScoresService = {
  getByEntityId(source, entityId, role) {
    if (!getRiskScoresPermissions(role).canView) return null;
    const rec = ensureRecord(source, entityId);
    if (!rec) return null;
    return toDetail(rec);
  },

  submitManualChange(source, entityId, input, role) {
    if (!getRiskScoresPermissions(role).canManualChange) {
      return { ok: false, error: 'rsc_forbidden' };
    }

    const validation = validateManualChange(input);
    if (!validation.ok) return { ok: false, error: validation.error };

    const rec = ensureRecord(source, entityId);
    if (!rec) return { ok: false, error: 'rsc_not_found' };

    if (pendingFor(rec)) return { ok: false, error: 'rsc_pending_approval' };

    const result = createRiskScoreApprovalRequest(
      {
        source,
        entityId: rec.entityId,
        entityKey: rec.entityKey,
        displayName: rec.displayName,
        oldScore: rec.score,
        newScore: input.newScore,
        reason: input.reason.trim(),
      },
      role,
    );

    if (!result.ok || !result.approvalId) {
      return { ok: false, error: result.error ?? 'rsc_approval_failed' };
    }

    recordStore = recordStore.map((r) =>
      r.entityKey === rec.entityKey ? { ...r, pendingApprovalId: result.approvalId } : r,
    );

    return { ok: true, approvalId: result.approvalId };
  },
};

export function __resetRiskScoresStoreForTest(): void {
  recordStore = RISK_SCORE_RECORDS.map((r) => ({ ...r }));
  historyStore = RISK_SCORE_HISTORY.map((h) => ({ ...h }));
  nextHistId = 10_000;
}

export function __applyRiskScoreApprovalForTest(approvalId: number): void {
  applyApprovedScore(approvalId);
}
