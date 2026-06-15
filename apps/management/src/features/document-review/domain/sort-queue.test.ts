import { describe, expect, it } from 'vitest';
import { sortQueueItems } from './sort-queue';
import type { ReviewQueueItem } from './types';

function item(partial: Partial<ReviewQueueItem> & Pick<ReviewQueueItem, 'id' | 'createdAt'>): ReviewQueueItem {
  return {
    customerId: 1,
    customerNo: 'MUS-000001',
    customerName: 'Test',
    nationality: 'TUR',
    suspiciousFlag: false,
    customerType: 'individual',
    category: 'ProofOfAddress',
    documentType: 'Fatura',
    approvalRequired: true,
    approvalStatus: 'Pending',
    documentStatus: 'Inactive',
    createdBy: 'test',
    recordStatus: 1,
    approvedAt: null,
    approvedBy: null,
    ...partial,
  };
}

describe('sortQueueItems', () => {
  it('spec §8 öncelik sırasını uygular', () => {
    const rows = sortQueueItems([
      item({ id: 4, createdAt: '2025-01-04', nationality: 'TUR' }),
      item({ id: 1, createdAt: '2025-01-01', suspiciousFlag: true, nationality: 'DEU' }),
      item({ id: 3, createdAt: '2025-01-03', nationality: 'DEU' }),
      item({ id: 2, createdAt: '2025-01-02', suspiciousFlag: true, nationality: 'TUR' }),
    ]);
    expect(rows.map((r) => r.id)).toEqual([1, 2, 3, 4]);
  });

  it('aynı grupta createdAt ASC sıralar', () => {
    const rows = sortQueueItems([
      item({ id: 2, createdAt: '2025-02-02', nationality: 'TUR' }),
      item({ id: 1, createdAt: '2025-02-01', nationality: 'TUR' }),
    ]);
    expect(rows.map((r) => r.id)).toEqual([1, 2]);
  });
});
