import { describe, expect, it, beforeEach } from 'vitest';
import { resetExternalBtransRefsForTest } from '@/mocks/external-btrans-system';
import {
  mockBtransIntegrationsAdapter,
  resetBtransIntegrationsStoreForTest,
} from './mock-btrans-integrations-adapter';

describe('mock-btrans-integrations-adapter', () => {
  beforeEach(() => {
    resetBtransIntegrationsStoreForTest();
    resetExternalBtransRefsForTest();
  });

  it('lists sorted by reportDate desc then lastSentAt desc for finance', () => {
    const rows = mockBtransIntegrationsAdapter.list(
      { status: 'all', reportName: 'all', dateFrom: '', dateTo: '' },
      'finance',
    );
    expect(rows.length).toBeGreaterThan(10);
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1]!;
      const cur = rows[i]!;
      const dateCmp = prev.reportDate.localeCompare(cur.reportDate);
      expect(dateCmp).toBeGreaterThanOrEqual(0);
      if (dateCmp === 0) {
        expect((prev.lastSentAt ?? '').localeCompare(cur.lastSentAt ?? '')).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('hold transitions ErrorSend to OnHold', () => {
    const r = mockBtransIntegrationsAdapter.hold('BTR-001', 'finance');
    expect(r.ok).toBe(true);
    const detail = mockBtransIntegrationsAdapter.getById('BTR-001', 'finance');
    expect(detail?.status).toBe('OnHold');
  });

  it('retry deduplicates when external ref exists', () => {
    const r = mockBtransIntegrationsAdapter.retry('BTR-004', 'compliance');
    expect(r.ok).toBe(true);
    expect(r.deduplicated).toBe(true);
    const detail = mockBtransIntegrationsAdapter.getById('BTR-004', 'compliance');
    expect(detail?.status).toBe('ErrorData');
  });

  it('cancel from OnHold', () => {
    const r = mockBtransIntegrationsAdapter.cancel('BTR-002', 'management');
    expect(r.ok).toBe(true);
    expect(mockBtransIntegrationsAdapter.getById('BTR-002', 'management')?.status).toBe('Canceled');
  });

  it('forbids ops role', () => {
    expect(
      mockBtransIntegrationsAdapter.list(
        { status: 'all', reportName: 'all', dateFrom: '', dateTo: '' },
        'ops',
      ),
    ).toEqual([]);
  });
});
