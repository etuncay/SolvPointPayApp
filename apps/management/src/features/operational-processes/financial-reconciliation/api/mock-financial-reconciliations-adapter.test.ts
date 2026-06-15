import { describe, expect, it, beforeEach } from 'vitest';
import {
  getFinancialReconciliationsStoreSnapshot,
  mockFinancialReconciliationsAdapter,
} from './mock-financial-reconciliations-adapter';
import { DEFAULT_FIN_RECON_FILTERS } from '../domain/types';

describe('mock-financial-reconciliations-adapter', () => {
  beforeEach(() => {
    mockFinancialReconciliationsAdapter.resetForTests();
  });

  it('finance listeler', () => {
    const rows = mockFinancialReconciliationsAdapter.list(DEFAULT_FIN_RECON_FILTERS, 'finance');
    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(rows[0]!.asOfTimestamp >= rows[1]!.asOfTimestamp).toBe(true);
  });

  it('compliance erişemez', () => {
    expect(mockFinancialReconciliationsAdapter.list(DEFAULT_FIN_RECON_FILTERS, 'compliance')).toEqual([]);
  });

  it('run snapshot ekler', () => {
    const before = getFinancialReconciliationsStoreSnapshot().length;
    const result = mockFinancialReconciliationsAdapter.run('finance');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.row.status).toBe('PendingReview');
      expect(getFinancialReconciliationsStoreSnapshot().length).toBe(before + 1);
    }
  });

  it('adjust PendingReview → Adjusted', () => {
    const result = mockFinancialReconciliationsAdapter.adjust('FR-002', 'Test düzeltme', 'finance');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.row.status).toBe('Adjusted');
      expect(result.row.description).toBe('Test düzeltme');
    }
  });

  it('adjust boş açıklama fail', () => {
    const result = mockFinancialReconciliationsAdapter.adjust('FR-002', '  ', 'finance');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('finrec_description_required');
  });

  it('Matched satır adjust fail', () => {
    const result = mockFinancialReconciliationsAdapter.adjust('FR-001', 'x', 'finance');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('finrec_invalid_status');
  });
});
