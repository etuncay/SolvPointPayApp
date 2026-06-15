import { describe, expect, it } from 'vitest';
import type { CompanyBankAccount } from './types';
import { hasDuplicateActiveIban } from './duplicate-rules';

const base: Omit<CompanyBankAccount, 'id' | 'iban'> = {
  bankId: 1,
  bankName: 'Test',
  accountType: 'Current',
  currency: 'TRY',
  balance: 0,
  branchCode: '001',
  accountNo: '123',
  suffix: null,
  lastUpdatedAt: '2026-05-23',
  status: 'Active',
  recordStatus: 1,
};

describe('duplicate-rules', () => {
  it('detects duplicate active IBAN', () => {
    const accounts: CompanyBankAccount[] = [
      { ...base, id: 1, iban: 'TR330006100519786457841326' },
    ];
    expect(hasDuplicateActiveIban('TR33 0006 1005 1978 6457 8413 26', accounts)).toBe(true);
    expect(hasDuplicateActiveIban('TR330006100519786457841326', accounts, 1)).toBe(false);
  });

  it('ignores inactive duplicate', () => {
    const accounts: CompanyBankAccount[] = [
      { ...base, id: 1, iban: 'TR330006100519786457841326', status: 'Inactive' },
    ];
    expect(hasDuplicateActiveIban('TR330006100519786457841326', accounts)).toBe(false);
  });
});
