import type { ReportCategory, ReportCode } from './report-codes';

export type ReportColumnDef = {
  key: string;
  labelKey: string;
};

export type ReportParams = {
  dateFrom?: string;
  dateTo?: string;
  reportDate?: string;
  currency?: string;
  channel?: string;
  entityType?: string;
};

export type ReportResult = {
  columns: ReportColumnDef[];
  rows: Record<string, unknown>[];
  summary?: Record<string, number>;
  generatedAt: string;
  correlationId: string;
};

export type ReportDefinition = {
  code: ReportCode;
  category: ReportCategory;
  titleKey: string;
  descriptionKey: string;
  requiresReportDate?: boolean;
  columnSummaryKeys: string[];
};

export type ReportArchiveEntry = {
  id: string;
  reportCode: ReportCode;
  params: ReportParams;
  correlationId: string;
  generatedAt: string;
  generatedBy: string;
  rowCount: number;
  resultSnapshot: ReportResult;
};

export type GeneratorContext = {
  role: string;
  userId: string;
  now: Date;
};

export type ReportGenerator = (
  params: ReportParams,
  ctx: GeneratorContext,
) => Promise<ReportResult>;

export type GenerateReportResult =
  | { ok: true; archiveId: string; result: ReportResult }
  | { ok: false; errorCode: string; correlationId: string };
