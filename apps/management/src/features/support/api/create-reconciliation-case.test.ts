import { describe, expect, it, beforeEach } from 'vitest';
import { resetSupportCasesStore } from '@/mocks/support-cases-store';
import { findOpenReconciliationCase } from '@/mocks/support-cases';
import { createReconciliationCase } from './mock-support-cases-adapter';

describe('createReconciliationCase', () => {
  beforeEach(() => resetSupportCasesStore());

  it('creates ReconciliationDiscrepancy case', () => {
    const row = createReconciliationCase({
      reconciliationId: 99,
      amountDelta: 500,
      referenceNo: 'REF-TEST',
      urgencyLevel: 'High',
      criticalityLevel: 'High',
    });
    expect(row.complaintType).toBe('ReconciliationDiscrepancy');
    expect(row.reconciliationId).toBe(99);
    expect(row.caseStatus).toBe('Assigned');
  });

  it('reuses open case for same reconciliation', () => {
    const first = createReconciliationCase({
      reconciliationId: 77,
      amountDelta: 100,
      referenceNo: 'REF-A',
      urgencyLevel: 'Medium',
      criticalityLevel: 'Medium',
    });
    const second = createReconciliationCase({
      reconciliationId: 77,
      amountDelta: 200,
      referenceNo: 'REF-B',
      urgencyLevel: 'High',
      criticalityLevel: 'High',
    });
    expect(second.id).toBe(first.id);
    expect(findOpenReconciliationCase(77)?.id).toBe(first.id);
  });
});
