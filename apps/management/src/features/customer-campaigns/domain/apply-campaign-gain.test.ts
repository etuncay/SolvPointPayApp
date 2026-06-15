import { describe, expect, it } from 'vitest';
import { applyCampaignGain } from './apply-campaign-gain';
import type { Campaign, CustomerCampaignAssignment } from './types';

const baseCampaign: Campaign = {
  id: 1,
  campaignCode: 'TEST_EUR',
  name: 'Test EUR',
  description: '',
  fixedFeeGainRate: 0.5,
  commissionGainRate: 0.5,
  transactionType: 'InternationalTransfer',
  currency: 'EUR',
  startDate: '2025-01-01',
  endDate: '2026-12-31',
  minTxAmount: null,
  maxGainPerTx: 100,
  maxGainTotal: 500,
  maxUsageCount: 10,
  status: 'Active',
  changedBy: 'test',
  changedAt: '2025-01-01T00:00:00',
  recordStatus: 1,
};

const baseAssignment: CustomerCampaignAssignment = {
  id: 1,
  customerId: 1,
  campaignId: 1,
  campaignCode: 'TEST_EUR',
  campaignName: 'Test EUR',
  assignedAt: '2025-01-01T00:00:00',
  endDate: '2026-12-31',
  usageCount: 0,
  totalGainTry: 0,
  status: 'Active',
};

describe('applyCampaignGain', () => {
  it('YP kazancı mock FX (EUR=37) ile TL hesaplar', () => {
    const result = applyCampaignGain(
      baseCampaign,
      baseAssignment,
      { fixedFee: 2, variableFeePct: 1, totalFee: 12 },
      1000,
      'EUR',
      '2025-06-01',
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.gainTry).toBeGreaterThan(0);
      expect(result.finalFee).toBeLessThan(12);
    }
  });

  it('toplam kazanç limiti aşıldığında hata döner', () => {
    const assignment = { ...baseAssignment, totalGainTry: 500 };
    const result = applyCampaignGain(
      baseCampaign,
      assignment,
      { fixedFee: 2, variableFeePct: 1, totalFee: 12 },
      1000,
      'EUR',
      '2025-06-01',
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('ccm_total_gain_limit');
  });

  it('min işlem tutarı karşılanmazsa hata döner', () => {
    const campaign = { ...baseCampaign, minTxAmount: 500 };
    const result = applyCampaignGain(
      campaign,
      baseAssignment,
      { fixedFee: 2, variableFeePct: 1, totalFee: 12 },
      100,
      'EUR',
      '2025-06-01',
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('ccm_min_tx_not_met');
  });
});
