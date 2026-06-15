import type { OccupationThreshold } from '@/features/risk-compliance/management/domain/types';

export const OCCUPATION_THRESHOLDS_SEED: OccupationThreshold[] = [
  {
    occupationId: 'OCC-001',
    occupationLabel: 'Serbest Meslek',
    maxMonthlyIncome: 250_000,
    maxSingleTxAmount: 50_000,
    maxMonthlyTxAmount: 180_000,
  },
  {
    occupationId: 'OCC-002',
    occupationLabel: 'Öğrenci',
    maxMonthlyIncome: 15_000,
    maxSingleTxAmount: 5_000,
    maxMonthlyTxAmount: 12_000,
  },
  {
    occupationId: 'OCC-003',
    occupationLabel: 'Emekli',
    maxMonthlyIncome: 40_000,
    maxSingleTxAmount: 10_000,
    maxMonthlyTxAmount: 35_000,
  },
];

export const OCCUPATION_OPTIONS = OCCUPATION_THRESHOLDS_SEED.map((o) => ({
  id: o.occupationId,
  label: o.occupationLabel,
}));
