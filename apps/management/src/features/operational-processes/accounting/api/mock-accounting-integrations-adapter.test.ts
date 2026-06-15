import { describe, expect, it, beforeEach } from 'vitest';
import { resetExternalAccountingRefsForTest } from '@/mocks/external-accounting-system';
import {
  mockAccountingIntegrationsAdapter,
  resetAccountingIntegrationsStoreForTest,
} from './mock-accounting-integrations-adapter';

describe('mock-accounting-integrations-adapter', () => {
  beforeEach(() => {
    resetAccountingIntegrationsStoreForTest();
    resetExternalAccountingRefsForTest();
  });

  it('lists sorted by transactionAt desc for finance', () => {
    const rows = mockAccountingIntegrationsAdapter.list({ query: '', status: 'all' }, 'finance');
    expect(rows.length).toBeGreaterThan(10);
    for (let i = 1; i < rows.length; i++) {
      expect(new Date(rows[i - 1]!.transactionAt).getTime()).toBeGreaterThanOrEqual(
        new Date(rows[i]!.transactionAt).getTime(),
      );
    }
  });

  it('hold transitions ErrorSend to OnHold', () => {
    const r = mockAccountingIntegrationsAdapter.hold('ACC-001', 'finance');
    expect(r.ok).toBe(true);
    const detail = mockAccountingIntegrationsAdapter.getById('ACC-001', 'finance');
    expect(detail?.status).toBe('OnHold');
  });

  it('retry deduplicates when external ref exists', () => {
    const r = mockAccountingIntegrationsAdapter.retry('ACC-004', 'finance');
    expect(r.ok).toBe(true);
    expect(r.deduplicated).toBe(true);
    const detail = mockAccountingIntegrationsAdapter.getById('ACC-004', 'finance');
    expect(detail?.status).toBe('ErrorData');
  });

  it('cancel from OnHold', () => {
    const r = mockAccountingIntegrationsAdapter.cancel('ACC-002', 'management');
    expect(r.ok).toBe(true);
    expect(mockAccountingIntegrationsAdapter.getById('ACC-002', 'management')?.status).toBe('Canceled');
  });

  it('forbids compliance role', () => {
    expect(mockAccountingIntegrationsAdapter.list({ query: '', status: 'all' }, 'compliance')).toEqual([]);
  });
});
