import type { ReferenceListItem } from '@/features/risk-compliance/management/domain/types';

const BASE = '2026-01-01T00:00:00Z';

export const REFERENCE_LIST_SEED: ReferenceListItem[] = [
  { id: 'RL-001', listCode: 'RiskyCountries', value: 'KP', sourceTag: 'fatf_feed', effectiveFrom: BASE },
  { id: 'RL-002', listCode: 'RiskyCountries', value: 'IR', sourceTag: 'manual', effectiveFrom: BASE },
  { id: 'RL-003', listCode: 'RiskyPhonePrefixes', value: '+90555', sourceTag: 'manual', effectiveFrom: BASE },
  { id: 'RL-004', listCode: 'RiskyEmailProviders', value: 'tempmail.com', sourceTag: 'manual', effectiveFrom: BASE },
  { id: 'RL-005', listCode: 'UsuallyUsedCurrencies', value: 'TRY', effectiveFrom: BASE },
  { id: 'RL-006', listCode: 'UsuallyUsedCurrencies', value: 'USD', effectiveFrom: BASE },
  { id: 'RL-007', listCode: 'UsuallyUsedCurrencies', value: 'EUR', effectiveFrom: BASE },
  { id: 'RL-008', listCode: 'RiskyIPs', value: '185.220.101.1', sourceTag: 'tor_feed', effectiveFrom: BASE },
  { id: 'RL-009', listCode: 'RiskyAgents', value: '12', effectiveFrom: BASE },
  { id: 'RL-010', listCode: 'RiskyCustomers', value: '99901', effectiveFrom: BASE },
];
