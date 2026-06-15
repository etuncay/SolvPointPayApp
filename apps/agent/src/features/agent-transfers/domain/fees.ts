import type { TransferVariant } from './types';
import type { TransferFeeTier } from './types';

const FEES: Record<TransferVariant, Record<string, TransferFeeTier[]>> = {
  ownWallet: {
    TRY: [
      { id: 'top-1', currency: 'TRY', minAmount: 0, maxAmount: 10_000, fixedFee: 0, rate: 0, campaignEndDate: null },
      { id: 'top-2', currency: 'TRY', minAmount: 10_000, maxAmount: null, fixedFee: 5, rate: 0.1, campaignEndDate: null },
    ],
  },
  bankAccount: {
    TRY: [
      { id: 'bank-1', currency: 'TRY', minAmount: 0, maxAmount: 50_000, fixedFee: 12, rate: 0.15, campaignEndDate: null },
      { id: 'bank-2', currency: 'TRY', minAmount: 50_000, maxAmount: null, fixedFee: 25, rate: 0.25, campaignEndDate: null },
    ],
  },
  person: {
    TRY: [
      { id: 'person-1', currency: 'TRY', minAmount: 0, maxAmount: 25_000, fixedFee: 8, rate: 0.2, campaignEndDate: null },
      { id: 'person-2', currency: 'TRY', minAmount: 25_000, maxAmount: null, fixedFee: 15, rate: 0.35, campaignEndDate: null },
    ],
  },
  abroad: {
    TRY: [
      { id: 'intl-1', currency: 'TRY', minAmount: 0, maxAmount: 100_000, fixedFee: 40, rate: 0.5, campaignEndDate: '2026-12-31' },
      { id: 'intl-2', currency: 'TRY', minAmount: 100_000, maxAmount: null, fixedFee: 75, rate: 0.65, campaignEndDate: null },
    ],
  },
};

export function getTransferFeeTiers(variant: TransferVariant, currency: string): TransferFeeTier[] {
  return FEES[variant][currency] ?? FEES[variant].TRY ?? [];
}

export function findActiveTier(amount: number, tiers: TransferFeeTier[]): TransferFeeTier | null {
  if (amount <= 0) return null;
  return tiers.find((t) => amount > t.minAmount && (t.maxAmount == null || amount <= t.maxAmount)) ?? null;
}

/** Aktif kademeden ücret: sabit + tutar * oran%. */
export function computeTransferFee(variant: TransferVariant, currency: string, amount: number): number {
  if (amount <= 0) return 0;
  const tier = findActiveTier(amount, getTransferFeeTiers(variant, currency));
  if (!tier) return 0;
  return tier.fixedFee + amount * (tier.rate / 100);
}
