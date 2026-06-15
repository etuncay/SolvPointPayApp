import type { RiskLevel } from '@/features/risk-compliance/shared/risk-classification';
import { RISK_LEVELS } from '@/features/risk-compliance/shared/risk-classification';
import { validateRiskBasedLimits } from '@/features/risk-compliance/limits/domain/limit-validation';
import type {
  EntityTypeCore,
  RiskBasedLimitRow,
  RiskBasedLimitVersion,
} from '@/features/risk-compliance/limits/domain/types';
import { ENTITY_TYPES } from '@/features/risk-compliance/limits/domain/types';
import { sortLimitRows } from '@/features/risk-compliance/limits/domain/limit-sort';

const LEVELS: (RiskLevel | null)[] = [null, ...RISK_LEVELS];

/** Monotonic geçerli şablon — global en gevşek */
function buildRowsForEntity(entityType: EntityTypeCore): RiskBasedLimitRow[] {
  const singles = [-1, 80_000, 60_000, 40_000, 20_000];
  const dailies = [-1, 400_000, 300_000, 200_000, 100_000];
  const monthlies = [-1, 1_600_000, 1_200_000, 800_000, 400_000];
  const approvals = [50_000, 64_000, 48_000, 32_000, 16_000];
  const intl: Array<'Allowed' | 'Forbidden'> = [
    'Allowed',
    'Allowed',
    'Allowed',
    'Forbidden',
    'Forbidden',
  ];

  return LEVELS.map((riskLevel, i) => ({
    entityType,
    riskLevel,
    singleTxLimit: singles[i]!,
    dailyLimit: dailies[i]!,
    monthlyLimit: monthlies[i]!,
    singleTxApprovalThreshold: approvals[i]!,
    internationalTransfer: intl[i]!,
  }));
}

function buildTemplate(): RiskBasedLimitRow[] {
  const rows = ENTITY_TYPES.flatMap((et) => buildRowsForEntity(et));
  return sortLimitRows(rows);
}

const V1_FROM = '2025-01-01T00:00:00Z';
const V1_TO = '2026-04-01T00:00:00Z';
const V2_FROM = '2026-04-01T00:00:00Z';

export const RISK_LIMIT_VERSION_V1: RiskBasedLimitVersion = {
  versionId: 'RLV-001',
  effectiveFrom: V1_FROM,
  effectiveTo: V1_TO,
  createdAt: V1_FROM,
  createdBy: 'system',
  rows: buildTemplate().map((r) =>
    r.entityType === 'IndividualCustomer' && r.riskLevel === 'High'
      ? { ...r, singleTxLimit: 60_000, singleTxApprovalThreshold: 48_000 }
      : r,
  ),
};

export const RISK_LIMIT_VERSION_V2: RiskBasedLimitVersion = {
  versionId: 'RLV-002',
  effectiveFrom: V2_FROM,
  effectiveTo: null,
  createdAt: V2_FROM,
  createdBy: 'system',
  rows: buildTemplate().map((r) => {
    if (r.entityType === 'IndividualCustomer' && r.riskLevel === 'High') {
      return { ...r, singleTxLimit: 50_000, singleTxApprovalThreshold: 40_000 };
    }
    if (r.entityType === 'IndividualCustomer' && r.riskLevel === 'Critical') {
      return { ...r, singleTxLimit: 10_000, singleTxApprovalThreshold: 8_000 };
    }
    if (r.entityType === 'Agent' && r.riskLevel === null) {
      return {
        ...r,
        singleTxLimit: -1,
        dailyLimit: -1,
        monthlyLimit: -1,
        singleTxApprovalThreshold: 75_000,
      };
    }
    return r;
  }),
};

if (!validateRiskBasedLimits(RISK_LIMIT_VERSION_V2.rows).ok) {
  throw new Error('Invalid RISK_LIMIT_VERSION_V2 seed');
}

export const RISK_LIMIT_VERSIONS: RiskBasedLimitVersion[] = [
  RISK_LIMIT_VERSION_V1,
  RISK_LIMIT_VERSION_V2,
];
