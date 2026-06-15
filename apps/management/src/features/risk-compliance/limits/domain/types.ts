import type { RiskLevel } from '../../shared/risk-classification';

export type EntityTypeCore = 'IndividualCustomer' | 'CorporateCustomer' | 'Agent';

export const ENTITY_TYPES: EntityTypeCore[] = [
  'IndividualCustomer',
  'CorporateCustomer',
  'Agent',
];

/** null = global (en gevşek tavan) */
export type RiskLevelOrGlobal = RiskLevel | null;

export type InternationalTransfer = 'Allowed' | 'Forbidden';

/** 0 = kapalı, -1 = limitsiz */
export type LimitValue = number;

export type RiskBasedLimitRow = {
  entityType: EntityTypeCore;
  riskLevel: RiskLevelOrGlobal;
  singleTxLimit: LimitValue;
  dailyLimit: LimitValue;
  monthlyLimit: LimitValue;
  singleTxApprovalThreshold: LimitValue;
  internationalTransfer: InternationalTransfer;
};

export type RiskBasedLimitVersion = {
  versionId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  rows: RiskBasedLimitRow[];
  createdAt: string;
  createdBy: string;
};

export type RiskLimitsCurrentPayload = {
  versionId: string;
  effectiveFrom: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  rows: RiskBasedLimitRow[];
};

export type ResolvedLimit = {
  entityType: EntityTypeCore;
  riskLevel: RiskLevel;
  sourceRiskLevel: RiskLevelOrGlobal;
  singleTxLimit: LimitValue;
  dailyLimit: LimitValue;
  monthlyLimit: LimitValue;
  singleTxApprovalThreshold: LimitValue;
  internationalTransfer: InternationalTransfer;
  isFallbackDefault: boolean;
};

export type LimitValidationErrorCode =
  | 'rl_global_cap'
  | 'rl_monotonic'
  | 'rl_approval_exceeds'
  | 'rl_monthly_lt_daily'
  | 'rl_duplicate_row';

export type LimitValidationResult =
  | { ok: true }
  | { ok: false; errors: { code: LimitValidationErrorCode; message?: string }[] };

export type RiskLimitAuditEntry = {
  id: number;
  action: 'save_version';
  versionId: string;
  at: string;
  by: string;
};
