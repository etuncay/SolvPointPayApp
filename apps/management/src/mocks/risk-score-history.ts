import type { ScoreHistoryEntry } from '@/features/risk-compliance/scores/domain/types';
import { entityKey } from '@/features/risk-compliance/scores/domain/types';
import type { RiskLevel } from '@/features/risk-compliance/shared/risk-classification';

function hist(
  key: string,
  at: string,
  score: number,
  category: RiskLevel,
  changeType: ScoreHistoryEntry['changeType'] = 'calculated',
): ScoreHistoryEntry {
  return {
    id: `${key}-${at}`,
    entityKey: key,
    at,
    score,
    category,
    changeType,
  };
}

const C10042 = entityKey('Customer', '10042');
const AG001 = entityKey('Agent', 'AG-001');
const TX001 = entityKey('Transaction', 'TX-2024-001');

export const RISK_SCORE_HISTORY: ScoreHistoryEntry[] = [
  hist(C10042, '2026-01-10T08:00:00Z', 22, 'Low'),
  hist(C10042, '2026-02-15T10:00:00Z', 38, 'Medium'),
  hist(C10042, '2026-03-20T12:00:00Z', 55, 'Medium'),
  hist(C10042, '2026-04-18T09:30:00Z', 62, 'High'),
  hist(C10042, '2026-05-01T16:00:00Z', 58, 'Medium'),
  hist(C10042, '2026-05-20T14:30:00Z', 68, 'High'),
  hist(AG001, '2026-02-01T08:00:00Z', 30, 'Low'),
  hist(AG001, '2026-03-10T11:00:00Z', 38, 'Medium'),
  hist(AG001, '2026-04-05T14:00:00Z', 42, 'Medium'),
  hist(AG001, '2026-05-21T09:00:00Z', 45, 'Medium'),
  hist(TX001, '2026-05-10T10:00:00Z', 40, 'Medium'),
  hist(TX001, '2026-05-15T12:00:00Z', 48, 'Medium'),
  hist(TX001, '2026-05-22T11:15:00Z', 52, 'Medium'),
];
