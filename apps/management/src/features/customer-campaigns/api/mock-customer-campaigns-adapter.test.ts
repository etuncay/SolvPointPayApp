import { describe, expect, it, beforeEach } from 'vitest';
import { getCampaignPermissions } from '../domain/permissions';
import {
  mockCustomerCampaignsAdapter,
  resetCustomerCampaignsStore,
} from './mock-customer-campaigns-adapter';

describe('mockCustomerCampaignsAdapter', () => {
  beforeEach(() => {
    resetCustomerCampaignsStore();
  });

  it('batch ile süresi dolan kampanyayı pasifleştirir', () => {
    const before = mockCustomerCampaignsAdapter.list({
      query: '',
      transactionType: 'any',
      currency: 'any',
      status: 'any',
    });
    const expired = before.find((c) => c.id === 3008);
    expect(expired?.status).toBe('Passive');
  });

  it('update kampanya kodunu değiştirmez', () => {
    const row = mockCustomerCampaignsAdapter.list({ query: 'PREMIUM', transactionType: 'any', currency: 'any', status: 'Active' })[0];
    expect(row).toBeDefined();

    const updated = mockCustomerCampaignsAdapter.update(row!.id, {
      name: 'Premium Güncellendi',
      description: row!.description,
      fixedFeeGainRate: row!.fixedFeeGainRate,
      commissionGainRate: row!.commissionGainRate,
      transactionType: row!.transactionType,
      currency: row!.currency,
      startDate: row!.startDate,
      endDate: row!.endDate,
      minTxAmount: row!.minTxAmount,
      maxGainPerTx: row!.maxGainPerTx,
      maxGainTotal: row!.maxGainTotal,
      maxUsageCount: row!.maxUsageCount,
    });
    expect(updated.ok).toBe(true);

    const after = mockCustomerCampaignsAdapter.list({ query: 'PREMIUM', transactionType: 'any', currency: 'any', status: 'any' }).find((c) => c.id === row!.id);
    expect(after?.campaignCode).toBe('PREMIUM_TR');
    expect(after?.name).toBe('Premium Güncellendi');
  });

  it('ikinci kampanya atamasında confirm ister, onay sonrası eski pasif olur', () => {
    const customerId = 99902;
    const before = mockCustomerCampaignsAdapter.getCustomerAssignment(customerId);
    expect(before?.campaignCode).toBe('PREMIUM_TR');

    const needsConfirm = mockCustomerCampaignsAdapter.assignToCustomer(customerId, 'Hoşgeldin Bonusu');
    expect(needsConfirm.ok).toBe(false);
    expect(needsConfirm.needsConfirm).toBe(true);

    const assigned = mockCustomerCampaignsAdapter.assignToCustomer(customerId, 'Hoşgeldin Bonusu', {
      confirm: true,
    });
    expect(assigned.ok).toBe(true);

    const active = mockCustomerCampaignsAdapter.getCustomerAssignment(customerId);
    expect(active?.campaignCode).toBe('WELCOME2026');
  });

  it('duplicate kampanya kodu oluşturmayı reddeder', () => {
    const result = mockCustomerCampaignsAdapter.create({
      campaignCode: 'PREMIUM_TR',
      name: 'Kopya',
      description: '',
      fixedFeeGainRate: 0.1,
      commissionGainRate: 0.1,
      transactionType: 'WalletToPerson',
      currency: 'TRY',
      startDate: null,
      endDate: null,
      minTxAmount: null,
      maxGainPerTx: null,
      maxGainTotal: null,
      maxUsageCount: null,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('ccm_code_duplicate');
  });
});

describe('getCampaignPermissions', () => {
  it('finance tam CRUD+export, ops list+export', () => {
    expect(getCampaignPermissions('finance')).toEqual({
      list: true,
      insert: true,
      update: true,
      export: true,
    });
    expect(getCampaignPermissions('ops')).toEqual({
      list: true,
      insert: false,
      update: false,
      export: true,
    });
    expect(getCampaignPermissions('compliance').export).toBe(false);
  });
});
