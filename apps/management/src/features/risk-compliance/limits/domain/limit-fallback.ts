import type { RiskLevel } from '../../shared/risk-classification';
import { RISK_LEVELS } from '../../shared/risk-classification';
import type {
  EntityTypeCore,
  ResolvedLimit,
  RiskBasedLimitRow,
  RiskLevelOrGlobal,
} from './types';

const FALLBACK_CHAIN: Record<RiskLevel, RiskLevelOrGlobal[]> = {
  Critical: ['Critical', 'High', 'Medium', 'Low', null],
  High: ['High', 'Medium', 'Low', null],
  Medium: ['Medium', 'Low', null],
  Low: ['Low', null],
};

const UNLIMITED_DEFAULT: Omit<ResolvedLimit, 'entityType' | 'riskLevel' | 'sourceRiskLevel' | 'isFallbackDefault'> = {
  singleTxLimit: -1,
  dailyLimit: -1,
  monthlyLimit: -1,
  singleTxApprovalThreshold: -1,
  internationalTransfer: 'Allowed',
};

export function resolveEffectiveLimit(
  rows: RiskBasedLimitRow[],
  entityType: EntityTypeCore,
  riskLevel: RiskLevel,
  _asOf?: Date,
): ResolvedLimit {
  const chain = FALLBACK_CHAIN[riskLevel];

  for (const level of chain) {
    const row = rows.find((r) => r.entityType === entityType && r.riskLevel === level);
    if (row) {
      return {
        entityType,
        riskLevel,
        sourceRiskLevel: level,
        singleTxLimit: row.singleTxLimit,
        dailyLimit: row.dailyLimit,
        monthlyLimit: row.monthlyLimit,
        singleTxApprovalThreshold: row.singleTxApprovalThreshold,
        internationalTransfer: row.internationalTransfer,
        isFallbackDefault: false,
      };
    }
  }

  return {
    entityType,
    riskLevel,
    sourceRiskLevel: null,
    ...UNLIMITED_DEFAULT,
    isFallbackDefault: true,
  };
}

/** Test yardımcısı — zincirde hangi seviyeler tanımlı */
export function definedLevelsForEntity(
  rows: RiskBasedLimitRow[],
  entityType: EntityTypeCore,
): RiskLevelOrGlobal[] {
  return rows.filter((r) => r.entityType === entityType).map((r) => r.riskLevel);
}
