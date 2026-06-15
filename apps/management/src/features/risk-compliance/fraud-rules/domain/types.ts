import type { FraudAction } from '../../shared/fraud-actions';
import type { RiskLevel } from '../../shared/risk-classification';

/** Liste + detay ortak aksiyon şekli (detay modülü genişletilmiş params kullanır) */
export type FraudRuleAction = {
  type: FraudAction;
  params?: Record<string, unknown>;
};

export type FraudScope = 'Onboarding' | 'Remittance';
export type FraudRuleStatus = 'Active' | 'Passive';

/** Tam kural kaydı — 7.4.1 getById aynı store'dan okur */
export type FraudRuleRecord = {
  id: string;
  triggerOrder: number;
  title: string;
  description?: string;
  scope: FraudScope;
  status: FraudRuleStatus;
  priority: RiskLevel;
  conditionDsl: string;
  regulationReference?: string;
  actionDetails: FraudRuleAction[];
  dslValidatedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  recordStatus: 0 | 1;
  truePositive: number;
  falsePositive: number;
  casesOpened: number;
  /** Ortalama vaka inceleme süresi (dakika) */
  avgCaseReviewMinutes: number;
};

/** Liste projection — spec §5–6 */
export type FraudRuleListItem = {
  id: string;
  triggerOrder: number;
  title: string;
  scope: FraudScope;
  status: FraudRuleStatus;
  priority: RiskLevel;
  truePositive: number;
  falsePositive: number;
  casesOpened: number;
  avgCaseReviewMinutes: number;
};

export type FraudRuleFilters = {
  query: string;
  scope: FraudScope | 'all';
  status: FraudRuleStatus | 'all';
};

export const EMPTY_FRAUD_RULE_FILTERS: FraudRuleFilters = {
  query: '',
  scope: 'all',
  status: 'all',
};

export function toListItem(r: FraudRuleRecord): FraudRuleListItem {
  return {
    id: r.id,
    triggerOrder: r.triggerOrder,
    title: r.title,
    scope: r.scope,
    status: r.status,
    priority: r.priority,
    truePositive: r.truePositive,
    falsePositive: r.falsePositive,
    casesOpened: r.casesOpened,
    avgCaseReviewMinutes: r.avgCaseReviewMinutes,
  };
}
