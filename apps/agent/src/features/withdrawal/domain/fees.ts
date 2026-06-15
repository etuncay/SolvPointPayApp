import type { WithdrawalFeeTier } from './types';

/** Para çekme ücret kademeleri (mock — GET /agent/fees/withdrawal). */
const WITHDRAWAL_FEE_TIERS: Record<string, WithdrawalFeeTier[]> = {
  TRY: [
    { id: 'try-1', currency: 'TRY', minAmount: 0, maxAmount: 5_000, fixedFee: 15, rate: 0.2, campaignEndDate: null },
    { id: 'try-2', currency: 'TRY', minAmount: 5_000, maxAmount: 25_000, fixedFee: 25, rate: 0.35, campaignEndDate: null },
    { id: 'try-3', currency: 'TRY', minAmount: 25_000, maxAmount: null, fixedFee: 40, rate: 0.5, campaignEndDate: '2026-12-31' },
  ],
  USD: [
    { id: 'usd-1', currency: 'USD', minAmount: 0, maxAmount: 1_000, fixedFee: 3, rate: 0.25, campaignEndDate: null },
    { id: 'usd-2', currency: 'USD', minAmount: 1_000, maxAmount: null, fixedFee: 6, rate: 0.4, campaignEndDate: null },
  ],
  EUR: [
    { id: 'eur-1', currency: 'EUR', minAmount: 0, maxAmount: 1_000, fixedFee: 3, rate: 0.25, campaignEndDate: null },
    { id: 'eur-2', currency: 'EUR', minAmount: 1_000, maxAmount: null, fixedFee: 6, rate: 0.4, campaignEndDate: null },
  ],
};

export function getWithdrawalFeeTiers(currency: string): WithdrawalFeeTier[] {
  return WITHDRAWAL_FEE_TIERS[currency] ?? WITHDRAWAL_FEE_TIERS.TRY!;
}

/** Tutara karşılık gelen aktif kademe (üst sınır dahil değil, son kademe açık uçlu). */
export function findActiveTier(amount: number, tiers: WithdrawalFeeTier[]): WithdrawalFeeTier | null {
  if (amount <= 0) return null;
  return (
    tiers.find((t) => amount > t.minAmount && (t.maxAmount == null || amount <= t.maxAmount)) ?? null
  );
}

export function calcWithdrawalFee(amount: number, tier: WithdrawalFeeTier | null): {
  fixed: number;
  variable: number;
  total: number;
} {
  if (!tier || amount <= 0) return { fixed: 0, variable: 0, total: 0 };
  const fixed = tier.fixedFee;
  const variable = Math.round(((amount * tier.rate) / 100) * 100) / 100;
  return { fixed, variable, total: fixed + variable };
}
