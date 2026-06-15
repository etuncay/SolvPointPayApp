import { describe, expect, it, beforeEach } from 'vitest';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import {
  mockFraudCasesAdapter,
  __resetFraudCasesStoreForTest,
} from './mock-fraud-cases-adapter';
import { DEFAULT_CASE_FILTERS } from '../domain/types';

describe('mockFraudCasesAdapter', () => {
  beforeEach(() => {
    __resetFraudCasesStoreForTest();
  });

  it('default list — yalnızca open statuses', () => {
    const rows = mockFraudCasesAdapter.list({ ...DEFAULT_CASE_FILTERS }, 'compliance');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => !r.caseStatus.startsWith('Resolved') && r.caseStatus !== 'Rejected')).toBe(
      true,
    );
  });

  it('closed filter', () => {
    const rows = mockFraudCasesAdapter.list(
      { ...DEFAULT_CASE_FILTERS, showClosed: true, quickFilter: 'closed' },
      'compliance',
    );
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.caseStatus.startsWith('Resolved') || r.caseStatus === 'Rejected')).toBe(
      true,
    );
  });

  it('high_priority — High+Critical only', () => {
    const rows = mockFraudCasesAdapter.list(
      { ...DEFAULT_CASE_FILTERS, quickFilter: 'high_priority' },
      'compliance',
    );
    expect(rows.every((r) => r.priority === 'High' || r.priority === 'Critical')).toBe(true);
  });

  it('assigned_me — compliance user', () => {
    const rows = mockFraudCasesAdapter.list(
      { ...DEFAULT_CASE_FILTERS, quickFilter: 'assigned_me' },
      'compliance',
    );
    expect(rows.length).toBeGreaterThanOrEqual(1);
    const rec = rows.every((r) => r.assignedUserName?.includes('Ayşe') || r.assignedUserName);
    expect(rec).toBe(true);
  });

  it('sort — Critical before Low when both present', () => {
    const rows = mockFraudCasesAdapter.list({ ...DEFAULT_CASE_FILTERS }, 'compliance');
    const critIdx = rows.findIndex((r) => r.priority === 'Critical');
    const lowIdx = rows.findIndex((r) => r.priority === 'Low');
    if (critIdx >= 0 && lowIdx >= 0) expect(critIdx).toBeLessThan(lowIdx);
  });

  it('sla_due subset', () => {
    const rows = mockFraudCasesAdapter.list(
      { ...DEFAULT_CASE_FILTERS, quickFilter: 'sla_due' },
      'compliance',
    );
    expect(rows.length).toBeGreaterThan(0);
  });

  it('ops rol list boş', () => {
    expect(mockFraudCasesAdapter.list(DEFAULT_CASE_FILTERS, 'ops')).toEqual([]);
  });
});
