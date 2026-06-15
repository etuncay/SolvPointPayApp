import { describe, expect, it, beforeEach } from 'vitest';
import {
  mockFraudRulesAdapter,
  __resetFraudRulesStoreForTest,
} from './mock-fraud-rules-adapter';

describe('mockFraudRulesAdapter', () => {
  beforeEach(() => {
    __resetFraudRulesStoreForTest();
  });

  it('list default sort triggerOrder ASC', () => {
    const rows = mockFraudRulesAdapter.list(
      { query: '', scope: 'all', status: 'all' },
      'compliance',
    );
    expect(rows.length).toBeGreaterThanOrEqual(12);
    const orders = rows.map((r) => r.triggerOrder);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(orders[0]).toBe(1);
    expect(orders[1]).toBe(2);
    expect(orders[2]).toBe(3);
  });

  it('filter scope Remittance', () => {
    const rows = mockFraudRulesAdapter.list(
      { query: '', scope: 'Remittance', status: 'all' },
      'compliance',
    );
    expect(rows.every((r) => r.scope === 'Remittance')).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
  });

  it('recordStatus=0 gizli', () => {
    const rows = mockFraudRulesAdapter.list(
      { query: '', scope: 'all', status: 'all' },
      'compliance',
    );
    expect(rows.some((r) => r.id === 'FR-DELETED')).toBe(false);
  });

  it('list item shape — 9 alan', () => {
    const row = mockFraudRulesAdapter.list(
      { query: '', scope: 'all', status: 'all' },
      'compliance',
    )[0]!;
    expect(row.id).toBeTruthy();
    expect(row.triggerOrder).toBeGreaterThan(0);
    expect(row.title).toBeTruthy();
    expect(['Onboarding', 'Remittance']).toContain(row.scope);
    expect(['Active', 'Passive']).toContain(row.status);
    expect(row.truePositive).toBeGreaterThanOrEqual(0);
    expect(row.falsePositive).toBeGreaterThanOrEqual(0);
    expect(row.casesOpened).toBeGreaterThanOrEqual(0);
    expect(row.avgCaseReviewMinutes).toBeGreaterThanOrEqual(0);
  });

  it('ops rol list boş', () => {
    expect(
      mockFraudRulesAdapter.list({ query: '', scope: 'all', status: 'all' }, 'ops'),
    ).toEqual([]);
  });
});
