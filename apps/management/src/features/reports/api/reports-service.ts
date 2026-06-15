import type { BackOfficeRole } from '@epay/ui';
import type { ReportCode } from '../domain/report-codes';
import type {
  GenerateReportResult,
  ReportArchiveEntry,
  ReportDefinition,
  ReportParams,
  ReportResult,
} from '../domain/types';

export type ReportsService = {
  getCatalog(role: BackOfficeRole): ReportDefinition[];
  generate(
    role: BackOfficeRole,
    userId: string,
    code: ReportCode,
    params: ReportParams,
  ): Promise<GenerateReportResult>;
  listArchive(role: BackOfficeRole, reportCode?: ReportCode, limit?: number): ReportArchiveEntry[];
  getArchiveEntry(role: BackOfficeRole, archiveId: string): ReportArchiveEntry | null;
  getAccessLog(): { at: string; action: string; reportCode?: string; correlationId?: string }[];
  resetForTests(): void;
};
