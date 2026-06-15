import { describe, expect, it, beforeEach } from 'vitest';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { reportsService } from './mock-reports-adapter';

describe('mock-reports-adapter', () => {
  beforeEach(() => reportsService.resetForTests());

  it('finance catalog excludes MASAK', () => {
    const cat = reportsService.getCatalog('finance');
    expect(cat.some((d) => d.code === 'str_output')).toBe(false);
    expect(cat.length).toBeGreaterThan(0);
  });

  it('generate returns correlationId', async () => {
    const user = getCurrentUser('finance');
    const result = await reportsService.generate('finance', user.id, 'financial_transactions', {
      dateFrom: '2026-04-01',
      dateTo: '2026-05-24',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.correlationId).toMatch(/^rpt-/);
      expect(result.result.rows.length).toBeGreaterThan(0);
    }
  });

  it('ops forbidden', async () => {
    const user = getCurrentUser('ops');
    const result = await reportsService.generate('ops', user.id, 'financial_transactions', {
      dateFrom: '2026-04-01',
      dateTo: '2026-05-24',
    });
    expect(result.ok).toBe(false);
  });
});
