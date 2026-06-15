import type { ReportArchiveEntry, ReportParams, ReportResult } from '@/features/reports/domain/types';
import type { ReportCode } from '@/features/reports/domain/report-codes';

let archive: ReportArchiveEntry[] = [];
let nextId = 1;

export function appendReportArchive(input: {
  reportCode: ReportCode;
  params: ReportParams;
  result: ReportResult;
  generatedBy: string;
}): ReportArchiveEntry {
  const entry: ReportArchiveEntry = {
    id: `arch-${nextId++}`,
    reportCode: input.reportCode,
    params: input.params,
    correlationId: input.result.correlationId,
    generatedAt: input.result.generatedAt,
    generatedBy: input.generatedBy,
    rowCount: input.result.rows.length,
    resultSnapshot: input.result,
  };
  archive = [entry, ...archive].slice(0, 200);
  return entry;
}

export function getReportArchiveById(id: string): ReportArchiveEntry | null {
  return archive.find((a) => a.id === id) ?? null;
}

export function listReportArchive(reportCode?: ReportCode, limit = 5): ReportArchiveEntry[] {
  let rows = [...archive];
  if (reportCode) rows = rows.filter((a) => a.reportCode === reportCode);
  return rows.slice(0, limit);
}

export function resetReportArchiveStore(): void {
  archive = [];
  nextId = 1;
}
