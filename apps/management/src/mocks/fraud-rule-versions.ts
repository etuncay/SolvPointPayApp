import type { FraudRuleVersion } from '@/features/risk-compliance/fraud-rules/detail/domain/types';

export const FRAUD_RULE_VERSIONS: FraudRuleVersion[] = [
  {
    id: 'FRV-001-1',
    ruleId: 'FR-001',
    versionNo: 1,
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2025-12-01T10:00:00Z',
    conditionDsl: 'blacklistMatch = true',
    actionSummary: 'Block, CreateCase',
    description: 'İlk kara liste kuralı',
  },
  {
    id: 'FRV-001-2',
    ruleId: 'FR-001',
    versionNo: 2,
    createdAt: '2026-02-10T14:00:00Z',
    updatedAt: '2026-03-01T09:00:00Z',
    conditionDsl: 'blacklistMatch = true',
    actionSummary: 'Block, CreateCase',
    description: 'Vaka oluşturma eklendi',
  },
  {
    id: 'FRV-002-1',
    ruleId: 'FR-002',
    versionNo: 1,
    createdAt: '2025-11-15T08:00:00Z',
    updatedAt: '2025-11-15T08:00:00Z',
    conditionDsl: 'amount > 50000',
    actionSummary: 'Hold',
    description: 'Eşik düşük',
  },
  {
    id: 'FRV-002-2',
    ruleId: 'FR-002',
    versionNo: 2,
    createdAt: '2026-01-20T11:00:00Z',
    updatedAt: '2026-04-05T16:30:00Z',
    conditionDsl: 'amount > 100000',
    actionSummary: 'Hold, CreateCase',
    description: 'Eşik 100K',
  },
];
