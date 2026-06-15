import type { RiskLevel } from '../../../shared/risk-classification';
import type { FraudAction } from '../../../shared/fraud-actions';
import type { FraudScope, FraudRuleStatus, FraudRuleRecord } from '../../domain/types';

export type BlockTarget = 'Transaction' | 'Wallet' | 'Customer';

export type BlockParams = {
  target: BlockTarget;
  durationMinutes?: number;
  amount?: number;
  channel?: string;
};

export type AddRiskParams = {
  target: 'Customer' | 'Agent';
  durationDays: number;
  riskPoints: number;
};

export type CreateCaseParams = {
  severity: RiskLevel;
};

export type FraudRuleAction = {
  type: FraudAction;
  params?: BlockParams | AddRiskParams | CreateCaseParams | Record<string, unknown>;
};

export type FraudRuleVersion = {
  id: string;
  ruleId: string;
  versionNo: number;
  createdAt: string;
  updatedAt: string;
  conditionDsl: string;
  actionSummary: string;
  description?: string;
};

export type FraudRuleException = {
  id: string;
  ruleId: string;
  customerNo: string;
  expiresAt: string;
  note: string;
  createdAt: string;
};

export type FraudRuleDetail = {
  rule: FraudRuleRecord;
  versions: FraudRuleVersion[];
  exceptions: FraudRuleException[];
};

export type FraudRuleInput = {
  title: string;
  description: string;
  scope: FraudScope;
  conditionDsl: string;
  status: FraudRuleStatus;
  priority: RiskLevel;
  regulationReference: string;
  actionDetails: FraudRuleAction[];
  dslValidatedAt: string | null;
};

export type FraudExceptionInput = {
  customerNo: string;
  expiresAt: string;
  note: string;
};

export type FraudSimulationResult = {
  totalTransactions: number;
  blockedCount: number;
  casesOpened: number;
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
};

export type FraudRuleSaveResult = {
  ok: boolean;
  error?: string;
  id?: string;
};

export function actionSummary(actions: FraudRuleAction[]): string {
  return actions.map((a) => a.type).join(', ') || '—';
}

export function defaultBlockParams(): BlockParams {
  return { target: 'Transaction', durationMinutes: 60 };
}

export function defaultAddRiskParams(): AddRiskParams {
  return { target: 'Customer', durationDays: 30, riskPoints: 10 };
}

export function defaultCreateCaseParams(): CreateCaseParams {
  return { severity: 'Medium' };
}

export const EMPTY_FRAUD_RULE_INPUT: FraudRuleInput = {
  title: '',
  description: '',
  scope: 'Remittance',
  conditionDsl: '',
  status: 'Active',
  priority: 'Medium',
  regulationReference: '',
  actionDetails: [{ type: 'CreateCase', params: defaultCreateCaseParams() }],
  dslValidatedAt: null,
};

export function recordToInput(rule: FraudRuleRecord): FraudRuleInput {
  return {
    title: rule.title,
    description: rule.description ?? '',
    scope: rule.scope,
    conditionDsl: rule.conditionDsl,
    status: rule.status,
    priority: rule.priority,
    regulationReference: rule.regulationReference ?? '',
    actionDetails: rule.actionDetails.map((a) => ({ ...a, params: a.params ? { ...a.params } : undefined })),
    dslValidatedAt: rule.dslValidatedAt ?? null,
  };
}
