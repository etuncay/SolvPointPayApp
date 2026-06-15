import type { FraudRuleException } from '@/features/risk-compliance/fraud-rules/detail/domain/types';

export const FRAUD_RULE_EXCEPTIONS: FraudRuleException[] = [
  {
    id: 'FRE-001',
    ruleId: 'FR-001',
    customerNo: '10042',
    expiresAt: '2026-12-31',
    note: 'VIP müşteri — geçici istisna',
    createdAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'FRE-002',
    ruleId: 'FR-002',
    customerNo: '99901',
    expiresAt: '2026-08-15',
    note: 'Kurumsal limit anlaşması',
    createdAt: '2026-05-10T12:00:00Z',
  },
];
