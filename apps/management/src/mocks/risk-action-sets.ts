import type { FraudAction } from '@/features/risk-compliance/shared/fraud-actions';
import type { RiskActionSet, RiskLevel } from '@/features/risk-compliance/score-definition/domain/types';
import type { RiskScoreScope } from '@/features/risk-compliance/shared/rule-dsl/variables';

function set(
  scope: RiskScoreScope,
  riskLevel: RiskLevel,
  actions: FraudAction[],
): RiskActionSet {
  return { scope, riskLevel, actions };
}

export const RISK_ACTION_SETS: RiskActionSet[] = [
  set('Customer', 'Low', ['Allow']),
  set('Customer', 'Medium', ['Notify']),
  set('Customer', 'High', ['Hold', 'CreateCase']),
  set('Customer', 'Critical', ['Block', 'CreateCase']),
  set('Agent', 'Low', ['Allow']),
  set('Agent', 'Medium', ['Notify']),
  set('Agent', 'High', ['Hold', 'CreateCase']),
  set('Agent', 'Critical', ['Block']),
  set('Transaction', 'Low', ['Allow']),
  set('Transaction', 'Medium', ['Notify']),
  set('Transaction', 'High', ['Hold']),
  set('Transaction', 'Critical', ['Block', 'CreateCase']),
];
