import type { FeeCurrency } from '@/features/customer-fees/domain/types';
import { getEffectiveRate } from '@/lib/fx';
import type { Campaign, CustomerCampaignAssignment } from './types';

export type BaseFeeBreakdown = {
  fixedFee: number;
  variableFeePct: number;
  totalFee: number;
};

export type ApplyGainResult =
  | { ok: true; gainTry: number; finalFee: number }
  | { ok: false; error: string };

function toTry(amount: number, currency: FeeCurrency): number {
  return Math.round(amount * getEffectiveRate(currency) * 100) / 100;
}

function isCampaignEffective(campaign: Campaign, asOfDate: string): boolean {
  if (campaign.status !== 'Active' || campaign.recordStatus !== 1) return false;
  if (campaign.startDate && campaign.startDate > asOfDate) return false;
  if (campaign.endDate && campaign.endDate < asOfDate) return false;
  return true;
}

/** Spec §8 — standart ücret üzerine kampanya kazancı */
export function applyCampaignGain(
  campaign: Campaign,
  assignment: CustomerCampaignAssignment,
  base: BaseFeeBreakdown,
  txAmount: number,
  currency: FeeCurrency,
  asOfDate: string,
): ApplyGainResult {
  if (!isCampaignEffective(campaign, asOfDate)) {
    return { ok: false, error: 'ccm_campaign_inactive' };
  }

  if (campaign.minTxAmount != null && txAmount < campaign.minTxAmount) {
    return { ok: false, error: 'ccm_min_tx_not_met' };
  }

  if (campaign.maxUsageCount != null && assignment.usageCount >= campaign.maxUsageCount) {
    return { ok: false, error: 'ccm_usage_limit' };
  }

  const variablePart = (txAmount * base.variableFeePct) / 100;
  const adjustedFixed = base.fixedFee * (1 - campaign.fixedFeeGainRate);
  const adjustedVariable = variablePart * (1 - campaign.commissionGainRate);
  const finalFee = Math.round((adjustedFixed + adjustedVariable) * 100) / 100;
  let gainTry = toTry(base.totalFee - finalFee, currency);

  if (campaign.maxGainPerTx != null) {
    const capTry = toTry(campaign.maxGainPerTx, currency);
    if (gainTry > capTry) gainTry = capTry;
  }

  if (campaign.maxGainTotal != null) {
    const remaining = campaign.maxGainTotal - assignment.totalGainTry;
    if (remaining <= 0) return { ok: false, error: 'ccm_total_gain_limit' };
    if (gainTry > remaining) gainTry = remaining;
  }

  const finalFeeFromGain =
    Math.round((base.totalFee - gainTry / getEffectiveRate(currency)) * 100) / 100;

  return {
    ok: true,
    gainTry: Math.round(gainTry * 100) / 100,
    finalFee: Math.max(0, finalFeeFromGain),
  };
}
