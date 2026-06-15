import { describe, expect, it, beforeEach } from 'vitest';
import { findOpenReconciliationCase } from '@/mocks/support-cases';
import { DEFAULT_BANK_RECONCILIATION_FILTERS } from '../domain/types';
import {
  getBankReconciliationsStoreSnapshot,
  mockBankReconciliationsAdapter,
  resetBankReconciliationsStore,
} from './mock-bank-reconciliations-adapter';

describe('mock-bank-reconciliations-adapter', () => {
  beforeEach(() => resetBankReconciliationsStore());

  it('list hides recordStatus=0', () => {
    const rows = mockBankReconciliationsAdapter.list(DEFAULT_BANK_RECONCILIATION_FILTERS, 'finance');
    expect(rows.every((r) => r.recordStatus === 1)).toBe(true);
    expect(rows.some((r) => r.referenceNo === 'REF-DELETED')).toBe(false);
  });

  it('run creates rows and returns summary', () => {
    const result = mockBankReconciliationsAdapter.run('finance');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rowsProcessed).toBeGreaterThan(0);
    expect(result.matched + result.unmatched).toBe(result.rowsProcessed);
  });

  it('run unmatched reuses same caseId', () => {
    mockBankReconciliationsAdapter.run('finance');
    const unmatched = getBankReconciliationsStoreSnapshot().filter(
      (r) => r.status === 'Unmatched' && r.caseId != null,
    );
    expect(unmatched.length).toBeGreaterThan(0);
    const sample = unmatched[0]!;
    const caseIdBefore = sample.caseId;
    mockBankReconciliationsAdapter.run('finance');
    const sampleAfter = getBankReconciliationsStoreSnapshot().find((r) => r.id === sample.id);
    expect(sampleAfter?.caseId).toBe(caseIdBefore);
    if (sampleAfter?.caseId) {
      expect(findOpenReconciliationCase(sampleAfter.id)?.id).toBe(caseIdBefore);
    }
  });

  it('closeFromCase twice is idempotent Adjusted', () => {
    const first = mockBankReconciliationsAdapter.closeFromCase(2, 'finance');
    expect(first.ok).toBe(true);
    const second = mockBankReconciliationsAdapter.closeFromCase(2, 'finance');
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.alreadyAdjusted).toBe(true);
    const row = getBankReconciliationsStoreSnapshot().find((r) => r.id === 2);
    expect(row?.status).toBe('Adjusted');
  });

  it('ops cannot run', () => {
    const result = mockBankReconciliationsAdapter.run('ops');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('br_run_forbidden');
  });

  it('ops can list', () => {
    const rows = mockBankReconciliationsAdapter.list(DEFAULT_BANK_RECONCILIATION_FILTERS, 'ops');
    expect(rows.length).toBeGreaterThan(0);
  });
});
