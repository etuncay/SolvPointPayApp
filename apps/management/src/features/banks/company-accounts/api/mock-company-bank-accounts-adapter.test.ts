import { describe, expect, it, beforeEach } from 'vitest';
import { isValidIban } from '../../shared/iban';
import { COMPANY_BANK_ACCOUNTS_SEED } from '@/mocks/company-bank-accounts';
import {
  getCompanyBankAccountsStoreSnapshot,
  mockCompanyBankAccountsAdapter,
  resetCompanyBankAccountsStore,
} from './mock-company-bank-accounts-adapter';

const inactiveBankInput = {
  bankId: 4,
  accountType: 'Current' as const,
  iban: 'TR680006400000000012345678',
  currency: 'TRY' as const,
  branchCode: '2210',
  accountNo: '99990099',
  suffix: null,
};

const newAccountInput = {
  bankId: 2,
  accountType: 'Current' as const,
  iban: 'TR320006200000000001234567',
  currency: 'TRY' as const,
  branchCode: '0342',
  accountNo: '99990099',
  suffix: null,
};

describe('company-bank-accounts seed IBANs', () => {
  it('all seed IBANs pass checksum', () => {
    for (const row of COMPANY_BANK_ACCOUNTS_SEED) {
      expect(isValidIban(row.iban), row.iban).toBe(true);
    }
  });
});

describe('mock-company-bank-accounts-adapter', () => {
  beforeEach(() => resetCompanyBankAccountsStore());

  it('list returns active-first rows with recordStatus=1', () => {
    const rows = mockCompanyBankAccountsAdapter.list();
    expect(rows.every((r) => r.recordStatus === 1)).toBe(true);
    const firstInactive = rows.findIndex((r) => r.status === 'Inactive');
    const lastActive = rows.map((r) => r.status).lastIndexOf('Active');
    if (firstInactive >= 0) expect(lastActive).toBeLessThan(firstInactive);
  });

  it('create duplicate active IBAN → cba_iban_duplicate', () => {
    const result = mockCompanyBankAccountsAdapter.create({
      ...newAccountInput,
      iban: 'TR330006100519786457841326',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('cba_iban_duplicate');
  });

  it('create with inactive bank → cba_bank_inactive', () => {
    const result = mockCompanyBankAccountsAdapter.create(inactiveBankInput);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('cba_bank_inactive');
  });

  it('update does not change balance from input', () => {
    const before = getCompanyBankAccountsStoreSnapshot().find((a) => a.id === 1)!;
    const balanceBefore = before.balance;
    mockCompanyBankAccountsAdapter.update(1, {
      bankId: before.bankId,
      accountType: before.accountType,
      iban: before.iban,
      currency: before.currency,
      branchCode: before.branchCode,
      accountNo: before.accountNo,
      suffix: before.suffix,
    });
    const after = getCompanyBankAccountsStoreSnapshot().find((a) => a.id === 1)!;
    expect(after.balance).toBe(balanceBefore);
  });

  it('fetchBalance updates balance and lastUpdatedAt', () => {
    const before = getCompanyBankAccountsStoreSnapshot().find((a) => a.id === 1)!;
    const result = mockCompanyBankAccountsAdapter.fetchBalance(1);
    expect(result.ok).toBe(true);
    const after = getCompanyBankAccountsStoreSnapshot().find((a) => a.id === 1)!;
    expect(after.lastUpdatedAt).not.toBe(before.lastUpdatedAt);
    expect(after.balance).not.toBe(before.balance);
  });

  it('update inactive row → cba_inactive_locked', () => {
    const row = getCompanyBankAccountsStoreSnapshot().find((a) => a.id === 4)!;
    const result = mockCompanyBankAccountsAdapter.update(4, {
      bankId: row.bankId,
      accountType: row.accountType,
      iban: row.iban,
      currency: row.currency,
      branchCode: row.branchCode,
      accountNo: row.accountNo,
      suffix: row.suffix,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('cba_inactive_locked');
  });
});
