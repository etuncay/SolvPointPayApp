import { describe, expect, it, beforeEach } from 'vitest';
import { resetReportArchiveStore } from '@/mocks/report-archive-store';
import { reportsService } from './mock-reports-adapter';
import { runDailyTcmbReportBatch } from './daily-report-batch';

describe('daily-report-batch', () => {
  beforeEach(() => {
    reportsService.resetForTests();
    resetReportArchiveStore();
  });

  it('generates two daily reports', async () => {
    const first = await runDailyTcmbReportBatch('2026-05-24');
    expect(first.generated.length).toBe(2);
    const second = await runDailyTcmbReportBatch('2026-05-24');
    expect(second.skipped.length).toBe(2);
  });
});
