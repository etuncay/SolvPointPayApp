import type { ComplaintType } from '../../domain/types';

export type ReportCode =
  | 'by-complaint-type'
  | 'by-case-age'
  | 'customers-by-cases'
  | 'agents-by-cases';

export type CaseAgeBucket = '0_1' | '1_5' | '5_10' | 'gt_10';

export type CaseAgeSummary = Record<CaseAgeBucket, number>;

export type ComplaintTypeCountRow = {
  complaintType: ComplaintType;
  count: number;
};

export type EntityCaseReportRow = {
  entityNo: string;
  displayName: string;
  riskScore: number;
  monthlyAvgVolumeTry: number;
  caseCount: number;
};

export type PanelResult<T> =
  | { ok: true; data: T; refreshedAt: string }
  | { ok: false; errorCode: string };

export type SupportReportBundle = {
  panels: Partial<Record<ReportCode, PanelResult<unknown>>>;
};

export type SupportReportAccessLogEntry = {
  at: string;
  action: 'view_bundle' | 'view_panel';
  reportCode?: ReportCode;
  role: string;
  userId: string;
};

/** UI katmanı — risk dashboard ile uyumlu */
export type PanelState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T; refreshedAt: Date }
  | { status: 'error'; message: string };

export function panelResultToState<T>(result?: PanelResult<T>): PanelState<T> | undefined {
  if (!result) return { status: 'loading' };
  if (result.ok) {
    return { status: 'ready', data: result.data, refreshedAt: new Date(result.refreshedAt) };
  }
  return { status: 'error', message: result.errorCode };
}
