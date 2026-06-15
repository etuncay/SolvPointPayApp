import type { RiskScoreRule } from '@/features/risk-compliance/score-definition/domain/types';

function rule(
  partial: Omit<
    RiskScoreRule,
    'recordStatus' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'weight' | 'validatedAt'
  > & { weight?: number; validatedAt?: string | null },
): RiskScoreRule {
  const ts = '2026-05-01T10:00:00Z';
  const { weight, validatedAt, ...rest } = partial;
  return {
    ...rest,
    description: rest.description ?? null,
    weight: weight ?? 1,
    recordStatus: 1,
    createdAt: ts,
    createdBy: 'system',
    updatedAt: ts,
    updatedBy: 'system',
    validatedAt: validatedAt ?? ts,
  };
}

export const RISK_SCORE_RULES: RiskScoreRule[] = [
  rule({
    id: 'RSR-C1',
    scope: 'Customer',
    title: 'Yüksek işlem hacmi',
    conditionDsl: 'monthlyVolume > 500000',
    scoreContribution: 15,
    description: 'Aylık hacim eşiği',
    status: 'Active',
  }),
  rule({
    id: 'RSR-C2',
    scope: 'Customer',
    title: 'PEP flag',
    conditionDsl: 'pepFlag = true',
    scoreContribution: 25,
    description: 'PEP eşleşmesi',
    status: 'Active',
  }),
  rule({
    id: 'RSR-C3',
    scope: 'Customer',
    title: 'Düşük KYC',
    conditionDsl: "kycLevel = 'L1'",
    scoreContribution: 10,
    description: 'KYC L1',
    status: 'Passive',
  }),
  rule({
    id: 'RSR-A1',
    scope: 'Agent',
    title: 'Günlük anomali',
    conditionDsl: 'anomalyScore > 70',
    scoreContribution: 20,
    description: 'Anomali skoru',
    status: 'Active',
  }),
  rule({
    id: 'RSR-A2',
    scope: 'Agent',
    title: 'Yüksek şube sayısı',
    conditionDsl: 'branchCount > 5',
    scoreContribution: 8,
    description: null,
    status: 'Active',
  }),
  rule({
    id: 'RSR-T1',
    scope: 'Transaction',
    title: 'Tutar eşiği',
    conditionDsl: 'amount > 50000',
    scoreContribution: 10,
    description: null,
    status: 'Active',
  }),
  rule({
    id: 'RSR-T2',
    scope: 'Transaction',
    title: 'Yurt dışı',
    conditionDsl: 'isForeign = true',
    scoreContribution: 12,
    description: null,
    status: 'Active',
  }),
];
