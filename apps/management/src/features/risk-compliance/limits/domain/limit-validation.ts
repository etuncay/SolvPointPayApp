import type { RiskLevel } from '../../shared/risk-classification';
import { RISK_LEVELS } from '../../shared/risk-classification';
import {
  isApprovalThresholdValid,
  isInternationalMorePermissiveOrEqual,
  isLimitMorePermissiveOrEqual,
  isMonthlyGteDaily,
} from './limit-semantics';
import { rowKey } from './limit-sort';
import type { EntityTypeCore, LimitValidationResult, RiskBasedLimitRow } from './types';

const MONOTONIC_CHAIN: (RiskLevel | null)[] = [null, ...RISK_LEVELS];

function findRow(
  rows: RiskBasedLimitRow[],
  entityType: EntityTypeCore,
  riskLevel: RiskLevel | null,
): RiskBasedLimitRow | undefined {
  return rows.find((r) => r.entityType === entityType && r.riskLevel === riskLevel);
}

function rowIsMorePermissiveOrEqualThan(a: RiskBasedLimitRow, b: RiskBasedLimitRow): boolean {
  return (
    isLimitMorePermissiveOrEqual(a.singleTxLimit, b.singleTxLimit) &&
    isLimitMorePermissiveOrEqual(a.dailyLimit, b.dailyLimit) &&
    isLimitMorePermissiveOrEqual(a.monthlyLimit, b.monthlyLimit) &&
    isInternationalMorePermissiveOrEqual(a.internationalTransfer, b.internationalTransfer)
  );
}

export function validateRiskBasedLimits(rows: RiskBasedLimitRow[]): LimitValidationResult {
  const errors: { code: import('./types').LimitValidationErrorCode }[] = [];

  const keys = new Set<string>();
  for (const r of rows) {
    const k = rowKey(r.entityType, r.riskLevel);
    if (keys.has(k)) errors.push({ code: 'rl_duplicate_row' });
    keys.add(k);
  }

  for (const r of rows) {
    if (!isApprovalThresholdValid(r.singleTxLimit, r.singleTxApprovalThreshold)) {
      errors.push({ code: 'rl_approval_exceeds' });
    }
    if (!isMonthlyGteDaily(r.dailyLimit, r.monthlyLimit)) {
      errors.push({ code: 'rl_monthly_lt_daily' });
    }
  }

  for (const entityType of [...new Set(rows.map((r) => r.entityType))]) {
    const global = findRow(rows, entityType, null);
    if (!global) continue;

    for (const level of RISK_LEVELS) {
      const row = findRow(rows, entityType, level);
      if (!row) continue;
      if (!rowIsMorePermissiveOrEqualThan(global, row)) {
        errors.push({ code: 'rl_global_cap' });
      }
    }

    for (let i = 0; i < MONOTONIC_CHAIN.length - 1; i++) {
      const looser = findRow(rows, entityType, MONOTONIC_CHAIN[i]!);
      const stricter = findRow(rows, entityType, MONOTONIC_CHAIN[i + 1]!);
      if (!looser || !stricter) continue;
      if (!rowIsMorePermissiveOrEqualThan(looser, stricter)) {
        errors.push({ code: 'rl_monotonic' });
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true };
}
