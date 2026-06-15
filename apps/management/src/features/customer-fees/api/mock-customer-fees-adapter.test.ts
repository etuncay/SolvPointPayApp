import { describe, expect, it, beforeEach } from 'vitest';
import {
  mockCustomerFeesAdapter,
  resetCustomerFeesStore,
} from '../api/mock-customer-fees-adapter';

describe('mockCustomerFeesAdapter', () => {
  beforeEach(() => {
    resetCustomerFeesStore();
  });

  it('batch ile geçmiş endDate kayıtlarını pasifleştirir', () => {
    const before = mockCustomerFeesAdapter.list({ query: '', transactionType: 'any', currency: 'any', status: 'any' });
    const expired = before.find((f) => f.id === 1010);
    expect(expired?.status).toBe('Passive');
  });

  it('son base tier pasifleştirilemez', () => {
    const base = mockCustomerFeesAdapter
      .list({ query: '', transactionType: 'WalletToPerson', currency: 'TRY', status: 'Active' })
      .find((f) => f.id === 1001);
    expect(base).toBeDefined();

    const result = mockCustomerFeesAdapter.update(base!.id, {
      transactionType: 'WalletToPerson',
      currency: 'TRY',
      lowerLimit: 0,
      fixedFee: 1,
      variableFeePct: 1,
      startDate: '2025-01-01',
      endDate: null,
      sourceCountry: 'DEU',
      targetCountry: 'TUR',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('cfe_base_tier_required');
  });

  it('aynı combo yeni kayıt eski aktif kaydı pasifleştirir', () => {
    const base = mockCustomerFeesAdapter
      .list({ query: '', transactionType: 'WalletToPerson', currency: 'TRY', status: 'Active' })
      .find((f) => f.id === 1001);
    expect(base?.status).toBe('Active');

    const created = mockCustomerFeesAdapter.create({
      transactionType: 'WalletToPerson',
      currency: 'TRY',
      lowerLimit: 0,
      fixedFee: 0,
      variableFeePct: 4,
      startDate: '2025-06-01',
      endDate: null,
      sourceCountry: 'ALL',
      targetCountry: 'ALL',
    });
    expect(created.ok).toBe(true);

    const all = mockCustomerFeesAdapter.list({
      query: '',
      transactionType: 'WalletToPerson',
      currency: 'TRY',
      status: 'any',
    });
    const oldBase = all.find((f) => f.id === 1001);
    expect(oldBase?.status).toBe('Passive');
    const activeBases = all.filter(
      (f) =>
        f.status === 'Active' &&
        f.lowerLimit === 0 &&
        f.sourceCountry === 'ALL' &&
        f.targetCountry === 'ALL',
    );
    expect(activeBases.length).toBe(1);
    expect(activeBases[0]!.variableFeePct).toBe(4);
  });
});
