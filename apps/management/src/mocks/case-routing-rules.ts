import type { CaseRoutingRule } from '@/features/risk-compliance/management/domain/types';
import { DEFAULT_MANAGER_GROUP_ID, DEFAULT_OPERATOR_GROUP_ID } from '@/features/risk-compliance/management/domain/reference-list-codes';

export const CASE_ROUTING_RULES_SEED: CaseRoutingRule[] = [
  {
    id: 'CRR-001',
    conditionDsl: "amount > 50000 AND channel = 'Mobile'",
    targetGroupId: DEFAULT_MANAGER_GROUP_ID,
    autoDistribute: true,
    sortOrder: 1,
  },
  {
    id: 'CRR-002',
    conditionDsl: "amount > 10000",
    targetGroupId: DEFAULT_OPERATOR_GROUP_ID,
    autoDistribute: true,
    sortOrder: 2,
  },
];
