import type { FraudAction } from '../../shared/fraud-actions';
import type { RiskLevel } from '../../shared/risk-classification';
import type { RiskScoreScope } from '../../shared/rule-dsl/variables';

export type { RiskScoreScope, RiskLevel, FraudAction };

export type FraudRuleStatus = 'Active' | 'Passive';

export type RiskScoreRule = {
  id: string;
  scope: RiskScoreScope;
  title: string;
  conditionDsl: string;
  scoreContribution: number;
  weight: number;
  description: string | null;
  status: FraudRuleStatus;
  validatedAt: string | null;
  recordStatus: 0 | 1;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type RiskScoreRuleInput = {
  title: string;
  conditionDsl: string;
  scoreContribution: number;
  description?: string | null;
  validatedAt?: string | null;
};

export type RiskScoreRuleUpdateInput = Partial<RiskScoreRuleInput>;

export type RiskActionSet = {
  scope: RiskScoreScope;
  riskLevel: RiskLevel;
  actions: FraudAction[];
};

export type SimulationTransition = {
  fromLevel: RiskLevel;
  toLevel: RiskLevel;
  count: number;
};

export type SimulationResult = {
  scope: RiskScoreScope;
  transitions: SimulationTransition[];
  totalAffected: number;
};

export type RiskScoreRuleAuditEntry = {
  id: number;
  action: 'create' | 'update' | 'toggle' | 'save_actions';
  ruleId?: string;
  scope: RiskScoreScope;
  at: string;
  by: string;
};
