import { evaluateConditionDsl } from './rule-dsl/parser';
import type { RiskScoreScope } from './rule-dsl/variables';

export type ScoreRuleInput = {
  status: 'Active' | 'Passive';
  scoreContribution: number;
  weight?: number;
  conditionDsl: string;
};

/** Ağırlıklı skor toplamı — weight default 1, cap 0–100 */
export function computeWeightedScore(
  rules: ScoreRuleInput[],
  ctx: Record<string, unknown>,
  scope: RiskScoreScope,
): number {
  let total = 0;
  for (const rule of rules) {
    if (rule.status !== 'Active') continue;
    if (!evaluateConditionDsl(rule.conditionDsl, ctx, scope)) continue;
    const w = rule.weight ?? 1;
    total += w * rule.scoreContribution;
  }
  return Math.max(0, Math.min(100, total));
}
