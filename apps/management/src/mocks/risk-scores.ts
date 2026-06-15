import type { RiskScoreRecord } from '@/features/risk-compliance/scores/domain/types';
import { entityKey } from '@/features/risk-compliance/scores/domain/types';
import { classifyRiskLevel } from '@/features/risk-compliance/shared/risk-classification';

function rec(
  source: RiskScoreRecord['source'],
  entityId: string,
  displayName: string,
  score: number,
  calculatedAt: string,
  extra?: Partial<RiskScoreRecord>,
): RiskScoreRecord {
  return {
    entityKey: entityKey(source, entityId),
    source,
    entityId,
    displayName,
    score,
    level: classifyRiskLevel(score),
    calculatedAt,
    ...extra,
  };
}

/** Demo varlıklar — plan §4 */
export const RISK_SCORE_RECORDS: RiskScoreRecord[] = [
  rec('Customer', '10042', 'Demo Müşteri — Yüksek Risk', 68, '2026-05-20T14:30:00Z'),
  rec('Agent', 'AG-001', 'Anadolu Gıda Üretim A.Ş.', 45, '2026-05-21T09:00:00Z'),
  rec('Transaction', 'TX-2024-001', 'TX-2024-001', 52, '2026-05-22T11:15:00Z'),
];
