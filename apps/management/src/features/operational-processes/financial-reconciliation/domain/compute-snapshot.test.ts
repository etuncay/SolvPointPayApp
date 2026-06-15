import { describe, expect, it } from 'vitest';
import { buildFinancialReconciliationSnapshot, resolveStatus } from './compute-snapshot';

describe('buildFinancialReconciliationSnapshot', () => {
  it('diff=0 → Matched', () => {
    const snap = buildFinancialReconciliationSnapshot(
      new Date('2026-05-25T12:00:00Z'),
      { inventoryBalance: 100, accountingBalance: 100, bankTotalBalance: 100 },
    );
    expect(snap.status).toBe('Matched');
    expect(snap.diffInventoryAccounting).toBe(0);
    expect(snap.diffInventoryBank).toBe(0);
  });

  it('diff≠0 → PendingReview', () => {
    const snap = buildFinancialReconciliationSnapshot(
      new Date('2026-05-25T12:00:00Z'),
      { inventoryBalance: 100, accountingBalance: 110, bankTotalBalance: 95 },
    );
    expect(snap.status).toBe('PendingReview');
    expect(snap.diffInventoryAccounting).toBe(-10);
    expect(snap.diffInventoryBank).toBe(5);
  });

  it('tolerance içi → Matched', () => {
    expect(resolveStatus(0.005, -0.008, 0.01)).toBe('Matched');
  });
});
