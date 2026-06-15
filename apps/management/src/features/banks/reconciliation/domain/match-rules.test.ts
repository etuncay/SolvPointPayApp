import { describe, expect, it } from 'vitest';
import { RECON_PARAMS } from '@/mocks/reconciliation-params';
import { matchFirmToBank, type MatchLine } from './match-rules';

const firm: MatchLine = {
  referenceNo: 'REF-100',
  bankTransactionNo: 'BTX-100',
  amount: 1000,
  currency: 'TRY',
  transactionDate: '2026-05-20 12:00:00',
  bank: 'Ziraat Bankası',
};

describe('matchFirmToBank', () => {
  it('referenceNo exact match → Matched', () => {
    const movements: MatchLine[] = [
      {
        ...firm,
        referenceNo: 'REF-100',
        amount: 1000,
        bankTransactionNo: 'OTHER',
      },
    ];
    const result = matchFirmToBank(firm, movements, RECON_PARAMS);
    expect(result.status).toBe('Matched');
    expect(result.matchedBy).toBe('referenceNo');
  });

  it('refNo miss, bankTransactionNo hit → Matched', () => {
    const movements: MatchLine[] = [
      {
        ...firm,
        referenceNo: 'REF-OTHER',
        bankTransactionNo: 'BTX-100',
        amount: 1000,
      },
    ];
    const result = matchFirmToBank(firm, movements, RECON_PARAMS);
    expect(result.status).toBe('Matched');
    expect(result.matchedBy).toBe('bankTransactionNo');
  });

  it('amount+date tolerance hit → Matched', () => {
    const movements: MatchLine[] = [
      {
        referenceNo: 'X',
        bankTransactionNo: 'Y',
        amount: 1000,
        currency: 'TRY',
        transactionDate: '2026-05-20 12:30:00',
        bank: 'Garanti BBVA',
      },
    ];
    const result = matchFirmToBank(firm, movements, RECON_PARAMS);
    expect(result.status).toBe('Matched');
    expect(result.matchedBy).toBe('amountDate');
  });

  it('amount outside tolerance → Unmatched', () => {
    const movements: MatchLine[] = [
      {
        referenceNo: 'REF-100',
        bankTransactionNo: 'BTX-100',
        amount: 1000.5,
        currency: 'TRY',
        transactionDate: '2026-05-20 12:00:00',
        bank: 'Ziraat Bankası',
      },
    ];
    const result = matchFirmToBank(firm, movements, RECON_PARAMS);
    expect(result.status).toBe('Unmatched');
  });

  it('date outside tolerance on amountDate path → Unmatched', () => {
    const movements: MatchLine[] = [
      {
        referenceNo: 'X',
        bankTransactionNo: 'Y',
        amount: 1000,
        currency: 'TRY',
        transactionDate: '2026-05-20 15:00:00',
        bank: 'Garanti BBVA',
      },
    ];
    const result = matchFirmToBank(firm, movements, RECON_PARAMS);
    expect(result.status).toBe('Unmatched');
  });
});
