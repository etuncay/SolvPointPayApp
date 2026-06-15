import { describe, expect, it, beforeEach } from 'vitest';
import { resetSupportCasesStore } from '@/mocks/support-cases';
import { closeReconciliationFromCase, ensureReconciliationCase } from './case-bridge';
import type { BankReconciliation } from './types';

const unmatchedRow: BankReconciliation = {
  id: 50,
  bank: 'Ziraat Bankası',
  transactionDate: '2026-05-20 12:00:00',
  transactionType: 'WalletToBankAccount',
  referenceNo: 'REF-CASE-TEST',
  amount: 20_000,
  bankCurrency: 'TRY',
  bankAmount: 19_000,
  reconciliationDate: '2026-05-21 08:00:00',
  status: 'Unmatched',
  caseId: null,
  caseNo: null,
  firmSourceId: 'tx-test',
  recordStatus: 1,
};

describe('case-bridge', () => {
  beforeEach(() => resetSupportCasesStore());

  it('ensureReconciliationCase creates case for unmatched', () => {
    const first = ensureReconciliationCase(unmatchedRow);
    expect(first.created).toBe(true);
    expect(first.caseNo).toMatch(/^SC-/);

    const second = ensureReconciliationCase({ ...unmatchedRow, caseId: first.caseId });
    expect(second.caseId).toBe(first.caseId);
    expect(second.created).toBe(false);
  });

  it('closeReconciliationFromCase is idempotent', () => {
    const withCase = ensureReconciliationCase(unmatchedRow);
    const row = { ...unmatchedRow, caseId: withCase.caseId, caseNo: withCase.caseNo };
    const first = closeReconciliationFromCase(row);
    expect(first.alreadyAdjusted).toBe(false);
    const second = closeReconciliationFromCase({ ...row, status: 'Adjusted' });
    expect(second.alreadyAdjusted).toBe(true);
  });
});
