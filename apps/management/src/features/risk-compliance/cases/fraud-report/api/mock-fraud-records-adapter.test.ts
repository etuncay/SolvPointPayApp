import { describe, expect, it, beforeEach } from 'vitest';
import {
  __resetFraudCasesStoreForTest,
  __getFraudCasesStore,
} from '../../api/mock-fraud-cases-adapter';
import {
  mockFraudRecordsAdapter,
  __resetFraudRecordsStoreForTest,
  __getFraudRecordsStore,
} from './mock-fraud-records-adapter';
import type { FraudRecordInput } from '../domain/types';

const base: FraudRecordInput = {
  transactionNo: 'TX-NO-CASE',
  fraudType: 'Other',
  detectionSource: 'ManualReview',
  verdict: 'ConfirmedFraud',
  discoveryAt: '2026-05-24T14:00',
  lossAmount: 100,
  recoveredAmount: 0,
  notes: 'test',
};

describe('mockFraudRecordsAdapter', () => {
  beforeEach(() => {
    __resetFraudRecordsStoreForTest();
    __resetFraudCasesStoreForTest();
  });

  it('save twice same tx — upsert single row', () => {
    mockFraudRecordsAdapter.save(base);
    mockFraudRecordsAdapter.save({ ...base, lossAmount: 200 });
    const lookup = mockFraudRecordsAdapter.getByTransactionNo('TX-NO-CASE');
    const byTx = __getFraudRecordsStore().filter(
      (r) => lookup && r.transactionId === lookup.transactionId,
    );
    expect(byTx.length).toBe(1);
    expect(byTx[0]?.lossAmount).toBe(200);
  });

  it('saveWithCase no case — case store +1', () => {
    const before = __getFraudCasesStore().length;
    const r = mockFraudRecordsAdapter.saveWithCase(base);
    expect(r.ok).toBe(true);
    expect(r.caseId).toBeTruthy();
    expect(__getFraudCasesStore().length).toBe(before + 1);
  });

  it('saveWithCase linked exists — warn then skip', () => {
    const warn = mockFraudRecordsAdapter.saveWithCase(
      { ...base, transactionNo: 'TX-WITH-CASE', fraudType: 'PhishingScam' },
    );
    expect(warn.ok).toBe(false);
    expect(warn.error).toBe('frp_linked_case_warn');
    const before = __getFraudCasesStore().length;
    const r = mockFraudRecordsAdapter.saveWithCase(
      { ...base, transactionNo: 'TX-WITH-CASE', fraudType: 'PhishingScam' },
      true,
    );
    expect(r.ok).toBe(true);
    expect(r.caseSkipped).toBe(true);
    expect(__getFraudCasesStore().length).toBe(before);
  });

  it('getByTransactionNo TX-EXIST-001 — existing record', () => {
    const lookup = mockFraudRecordsAdapter.getByTransactionNo('TX-EXIST-001');
    expect(lookup?.record).not.toBeNull();
  });
});
