import { appendReportArchive, listReportArchive } from '@/mocks/report-archive-store';
import { getReportGenerator } from '../domain/generator-registry';
import type { ReportCode } from '../domain/report-codes';

const DAILY_CODES: ReportCode[] = ['daily_commission_fees', 'daily_reconciliation_inventory'];

export type BatchResult = {
  reportDate: string;
  generated: { code: ReportCode; archiveId: string; rowCount: number }[];
  skipped: ReportCode[];
};

export async function runDailyTcmbReportBatch(
  reportDate: string,
  generatedBy = 'system.batch',
): Promise<BatchResult> {
  const generated: BatchResult['generated'] = [];
  const skipped: ReportCode[] = [];

  for (const code of DAILY_CODES) {
    const existing = listReportArchive(code, 20).find(
      (a) => a.params.reportDate === reportDate && a.generatedBy === generatedBy,
    );
    if (existing) {
      skipped.push(code);
      continue;
    }
    const generator = getReportGenerator(code);
    if (!generator) continue;
    const result = await generator({ reportDate }, {
      role: 'finance',
      userId: generatedBy,
      now: new Date('2026-05-24T12:00:00Z'),
    });
    const entry = appendReportArchive({
      reportCode: code,
      params: { reportDate },
      result,
      generatedBy,
    });
    generated.push({ code, archiveId: entry.id, rowCount: entry.rowCount });
  }

  return { reportDate, generated, skipped };
}
