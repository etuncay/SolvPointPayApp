import { describe, expect, it, beforeEach } from 'vitest';
import { resetAgentGroupsStore } from '@/features/agent-groups/api/mock-agent-groups-adapter';
import {
  mockAgentFeesAdapter,
  resetAgentFeesStore,
} from './mock-agent-fees-adapter';

describe('mockAgentFeesAdapter', () => {
  beforeEach(() => {
    resetAgentFeesStore();
    resetAgentGroupsStore();
  });

  it('batch ile geçmiş endDate kayıtlarını pasifleştirir', () => {
    const before = mockAgentFeesAdapter.list({
      query: '',
      groupCode: 'SILVER',
      transactionType: 'WalletToBankAccount',
      currency: 'TRY',
      status: 'any',
    });
    const expired = before.find((f) => f.endDate === '2024-12-31');
    expect(expired?.status).toBe('Passive');
  });

  it('base tier olmadan kademe oluşturulamaz', () => {
    const result = mockAgentFeesAdapter.create({
      groupCode: 'GOLD',
      transactionType: 'InternationalTransfer',
      currency: 'EUR',
      lowerLimit: 100,
      fixedFee: 0,
      variableFeePct: 0.5,
      startDate: '2025-06-01',
      endDate: null,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('afee_base_tier_required');
  });

  it('aynı combo yeni kayıt eski aktif kaydı pasifleştirir', () => {
    const base = mockAgentFeesAdapter
      .list({
        query: '',
        groupCode: 'PLATINUM',
        transactionType: 'WalletToPerson',
        currency: 'TRY',
        status: 'Active',
      })
      .find((f) => f.lowerLimit === 0);
    expect(base?.status).toBe('Active');

    const created = mockAgentFeesAdapter.create({
      groupCode: 'PLATINUM',
      transactionType: 'WalletToPerson',
      currency: 'TRY',
      lowerLimit: 0,
      fixedFee: 0,
      variableFeePct: 0.15,
      startDate: '2025-06-01',
      endDate: null,
    });
    expect(created.ok).toBe(true);

    const all = mockAgentFeesAdapter.list({
      query: '',
      groupCode: 'PLATINUM',
      transactionType: 'WalletToPerson',
      currency: 'TRY',
      status: 'any',
    });
    const oldBase = all.find((f) => f.id === base!.id);
    expect(oldBase?.status).toBe('Passive');
    const activeBases = all.filter((f) => f.status === 'Active' && f.lowerLimit === 0);
    expect(activeBases.length).toBe(1);
    expect(activeBases[0]!.variableFeePct).toBe(0.15);
  });

  it('pasif gruba create → afee_passive_group', () => {
    const result = mockAgentFeesAdapter.create({
      groupCode: 'LEGACY_TIER',
      transactionType: 'WalletToPerson',
      currency: 'TRY',
      lowerLimit: 0,
      fixedFee: 0,
      variableFeePct: 1,
      startDate: '2025-06-01',
      endDate: null,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('afee_passive_group');
  });

  it('farklı limit yeni kademe — ikisi de Active', () => {
    const created = mockAgentFeesAdapter.create({
      groupCode: 'GOLD',
      transactionType: 'WalletToPerson',
      currency: 'TRY',
      lowerLimit: 25000,
      fixedFee: 0,
      variableFeePct: 0.35,
      startDate: '2025-06-01',
      endDate: null,
    });
    expect(created.ok).toBe(true);

    const active = mockAgentFeesAdapter.list({
      query: '',
      groupCode: 'GOLD',
      transactionType: 'WalletToPerson',
      currency: 'TRY',
      status: 'Active',
    });
    expect(active.filter((f) => f.lowerLimit === 0).length).toBe(1);
    expect(active.some((f) => f.lowerLimit === 25000)).toBe(true);
  });
});
