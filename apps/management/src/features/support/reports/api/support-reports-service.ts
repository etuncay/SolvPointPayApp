import type { BackOfficeRole } from '@epay/ui';
import type { ReportCode, SupportReportBundle } from '../domain/types';

export type SupportReportsService = {
  getAll(role: BackOfficeRole, userId: string, options?: { simulateError?: ReportCode }): Promise<SupportReportBundle>;
  getByCode(
    role: BackOfficeRole,
    userId: string,
    code: ReportCode,
  ): Promise<SupportReportBundle['panels'][ReportCode]>;
  getAccessLog(): { at: string; action: string; reportCode?: string }[];
  resetForTests(): void;
  setSimulateError(code: ReportCode | null): void;
};
