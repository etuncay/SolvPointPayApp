import type { RiskLevel } from '../../shared/risk-classification';

export type FraudRiskSource = 'Customer' | 'Agent' | 'Transaction';

export type RiskScoreRecord = {
  entityKey: string;
  source: FraudRiskSource;
  entityId: string;
  displayName: string;
  score: number;
  level: RiskLevel;
  calculatedAt: string;
  manualOverrideUntilRecalc?: boolean;
  pendingApprovalId?: number | null;
};

export type ScoreBreakdownItem = {
  ruleId: string;
  title: string;
  scoreContribution: number;
};

export type ScoreHistoryEntry = {
  id: string;
  entityKey: string;
  at: string;
  score: number;
  category: RiskLevel;
  changeType: 'calculated' | 'manual';
};

export type RiskScoreDetail = {
  source: FraudRiskSource;
  entityId: string;
  displayName: string;
  score: number;
  level: RiskLevel;
  calculatedAt: string;
  breakdown: ScoreBreakdownItem[];
  history: ScoreHistoryEntry[];
  pendingApprovalId: number | null;
  pendingApprovalRef: string | null;
  manualOverrideUntilRecalc: boolean;
};

export type ManualChangeInput = {
  newScore: number;
  reason: string;
};

export type RiskScoresActionResult = {
  ok: boolean;
  error?: string;
  approvalId?: number;
};

export function entityKey(source: FraudRiskSource, entityId: string): string {
  return `${source}:${entityId.trim()}`;
}
