import { describe, expect, it } from 'vitest';
import { CUSTOMER_FEES } from '@/mocks/customer-fees';
import { calculateFee, countryPriorityScore, hasActiveBaseTier } from './calculate-fee';
import type { CustomerFee } from './types';

const AS_OF = '2025-06-01';

describe('calculateFee', () => {
  it('base tier yoksa cfe_no_base_tier döner', () => {
    const withoutBase = CUSTOMER_FEES.filter(
      (f) =>
        !(
          f.transactionType === 'WalletToPerson' &&
          f.currency === 'TRY' &&
          f.lowerLimit === 0 &&
          f.sourceCountry === 'ALL' &&
          f.targetCountry === 'ALL'
        ),
    );
    const result = calculateFee(withoutBase, {
      transactionType: 'WalletToPerson',
      currency: 'TRY',
      amount: 1000,
      sourceCountry: 'TUR',
      targetCountry: 'TUR',
      asOfDate: AS_OF,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('cfe_no_base_tier');
  });

  it('15.000 TRY WalletToPerson TUR→TUR için %2 kademesi seçilir', () => {
    const result = calculateFee(CUSTOMER_FEES, {
      transactionType: 'WalletToPerson',
      currency: 'TRY',
      amount: 15000,
      sourceCountry: 'TUR',
      targetCountry: 'TUR',
      asOfDate: AS_OF,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.variableFeePct).toBe(2);
      expect(result.lowerLimit).toBe(10000);
      expect(result.totalFee).toBe(300);
    }
  });

  it('15.000 TRY DEU→TUR için spesifik ülke kaydı seçilir', () => {
    const result = calculateFee(CUSTOMER_FEES, {
      transactionType: 'WalletToPerson',
      currency: 'TRY',
      amount: 15000,
      sourceCountry: 'DEU',
      targetCountry: 'TUR',
      asOfDate: AS_OF,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.feeId).toBe(1004);
      expect(result.variableFeePct).toBe(3.5);
      expect(result.fixedFee).toBe(5);
    }
  });
});

describe('countryPriorityScore', () => {
  it('spesifik kaynak+hedef ALL+ALL den önce gelir', () => {
    expect(countryPriorityScore('DEU', 'TUR', 'DEU', 'TUR')).toBe(1);
    expect(countryPriorityScore('DEU', 'TUR', 'ALL', 'ALL')).toBe(4);
  });
});

describe('hasActiveBaseTier', () => {
  it('seed WalletToPerson TRY için base tier mevcut', () => {
    expect(hasActiveBaseTier(CUSTOMER_FEES, 'WalletToPerson', 'TRY', AS_OF)).toBe(true);
  });

  it('base tier pasif ise false döner', () => {
    const passiveBase: CustomerFee[] = CUSTOMER_FEES.map((f) =>
      f.id === 1001 ? { ...f, status: 'Passive' } : f,
    );
    expect(hasActiveBaseTier(passiveBase, 'WalletToPerson', 'TRY', AS_OF)).toBe(false);
  });
});
