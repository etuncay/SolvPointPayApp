import type { RiskLevel } from '../../shared/risk-classification';

const RANK: Record<RiskLevel, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

export function priorityRank(level: RiskLevel): number {
  return RANK[level];
}
