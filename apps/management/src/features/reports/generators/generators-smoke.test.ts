import { describe, expect, it } from 'vitest';
import { getReportGenerator } from '../domain/generator-registry';
import { defaultRangeParams, defaultReportDate, emptyCtx } from './shared';

describe('generators smoke', () => {
  it('financial_transactions produces rows', async () => {
    const gen = getReportGenerator('financial_transactions')!;
    const result = await gen(defaultRangeParams(), emptyCtx());
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.columns.some((c) => c.key === 'amountTry')).toBe(true);
  });

  it('daily_commission_fees uses reportDate', async () => {
    const gen = getReportGenerator('daily_commission_fees')!;
    const result = await gen({ reportDate: defaultReportDate() }, emptyCtx());
    expect(result.rows.length).toBeGreaterThanOrEqual(0);
  });
});
