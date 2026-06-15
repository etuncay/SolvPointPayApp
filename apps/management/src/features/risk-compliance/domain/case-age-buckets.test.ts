import { describe, expect, it } from 'vitest';
import { assignCaseAgeBucket, buildCaseAgeSummary } from './case-age-buckets';
import { OPEN_RISK_CASES } from '@/mocks/risk-cases';

describe('case-age-buckets', () => {
  const now = new Date('2026-05-24T12:00:00Z');

  it('0.5 gün → 0_1', () => {
    const opened = new Date(now);
    opened.setHours(opened.getHours() - 12);
    expect(assignCaseAgeBucket(opened, now)).toBe('0_1');
  });

  it('11 gün → gt_10', () => {
    const opened = new Date(now);
    opened.setDate(opened.getDate() - 11);
    expect(assignCaseAgeBucket(opened, now)).toBe('gt_10');
  });

  it('bucket toplamı açık vaka sayısına eşit', () => {
    const open = OPEN_RISK_CASES.filter((c) => c.status === 'open');
    const summary = buildCaseAgeSummary(open, now);
    const total = summary['0_1'] + summary['1_5'] + summary['5_10'] + summary.gt_10;
    expect(total).toBe(open.length);
  });
});
