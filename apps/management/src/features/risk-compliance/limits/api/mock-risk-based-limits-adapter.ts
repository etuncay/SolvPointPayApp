import { validateRiskBasedLimits } from '../domain/limit-validation';
import { sortLimitRows } from '../domain/limit-sort';
import type {
  RiskBasedLimitRow,
  RiskBasedLimitVersion,
  RiskLimitAuditEntry,
  RiskLimitsCurrentPayload,
} from '../domain/types';
import { RISK_LIMIT_VERSIONS } from '@/mocks/risk-based-limits';
import type { RiskBasedLimitsPort } from './risk-based-limits-service';
import {
  registerRiskLimitApprovalApply,
  type RiskLimitApprovalMeta,
} from './risk-limit-approval-bridge';

let versions: RiskBasedLimitVersion[] = RISK_LIMIT_VERSIONS.map((v) => ({
  ...v,
  rows: v.rows.map((r) => ({ ...r })),
}));
let nextVersionSeq = 3;
let nextAuditId = 1;
let auditLog: RiskLimitAuditEntry[] = [];

function nowIso() {
  return new Date().toISOString();
}

function versionAt(asOf: string): RiskBasedLimitVersion | null {
  const t = new Date(asOf).getTime();
  let match: RiskBasedLimitVersion | null = null;
  for (const v of versions) {
    const from = new Date(v.effectiveFrom).getTime();
    const to = v.effectiveTo ? new Date(v.effectiveTo).getTime() : Number.POSITIVE_INFINITY;
    if (t >= from && t < to) {
      if (!match || from > new Date(match.effectiveFrom).getTime()) match = v;
    }
  }
  return match;
}

function currentVersion(): RiskBasedLimitVersion {
  return versions.find((v) => v.effectiveTo === null) ?? versions[versions.length - 1]!;
}

function toPayload(v: RiskBasedLimitVersion): RiskLimitsCurrentPayload {
  return {
    versionId: v.versionId,
    effectiveFrom: v.effectiveFrom,
    lastUpdatedAt: v.createdAt,
    lastUpdatedBy: v.createdBy,
    rows: sortLimitRows(v.rows.map((r) => ({ ...r }))),
  };
}

export const mockRiskBasedLimitsAdapter: RiskBasedLimitsPort = {
  getCurrent() {
    return toPayload(currentVersion());
  },

  getEffective(asOf) {
    const v = versionAt(asOf);
    if (!v) {
      const earliest = [...versions].sort(
        (a, b) => new Date(a.effectiveFrom).getTime() - new Date(b.effectiveFrom).getTime(),
      )[0];
      if (!earliest) throw new Error('rl_no_version');
      return toPayload(earliest);
    }
    return toPayload(v);
  },

  saveVersion(rows) {
    const sorted = sortLimitRows(rows.map((r) => ({ ...r })));
    const validation = validateRiskBasedLimits(sorted);
    if (!validation.ok) {
      throw new Error(validation.errors[0]?.code ?? 'rl_validation_failed');
    }

    const ts = nowIso();
    const cur = currentVersion();
    if (cur.effectiveTo === null) {
      versions = versions.map((v) =>
        v.versionId === cur.versionId ? { ...v, effectiveTo: ts } : v,
      );
    }

    const next: RiskBasedLimitVersion = {
      versionId: `RLV-${String(nextVersionSeq++).padStart(3, '0')}`,
      effectiveFrom: ts,
      effectiveTo: null,
      rows: sorted,
      createdAt: ts,
      createdBy: 'current.user',
    };
    versions = [...versions, next];
    auditLog = [
      ...auditLog,
      {
        id: nextAuditId++,
        action: 'save_version',
        versionId: next.versionId,
        at: ts,
        by: 'current.user',
      },
    ];
    return toPayload(next);
  },

  getAuditLog() {
    return [...auditLog];
  },

  resetForTests() {
    versions = RISK_LIMIT_VERSIONS.map((v) => ({
      ...v,
      rows: v.rows.map((r) => ({ ...r })),
    }));
    nextVersionSeq = 3;
    nextAuditId = 1;
    auditLog = [];
  },
};

registerRiskLimitApprovalApply((meta: RiskLimitApprovalMeta) => {
  mockRiskBasedLimitsAdapter.saveVersion(meta.rows);
});
