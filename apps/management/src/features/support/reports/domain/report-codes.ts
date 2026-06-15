import type { ReportCode } from './types';

export type ReportMeta = {
  code: ReportCode;
  titleKey: string;
  kind: 'summary' | 'table';
  fullscreen: boolean;
};

export const SUPPORT_REPORT_CODES: ReportMeta[] = [
  { code: 'by-complaint-type', titleKey: 'scf_complaint_type', kind: 'summary', fullscreen: false },
  { code: 'by-case-age', titleKey: 'scr_panel_case_age', kind: 'summary', fullscreen: false },
  { code: 'customers-by-cases', titleKey: 'scr_panel_customers', kind: 'table', fullscreen: true },
  { code: 'agents-by-cases', titleKey: 'scr_panel_agents', kind: 'table', fullscreen: true },
];

export const ALL_REPORT_CODES: ReportCode[] = SUPPORT_REPORT_CODES.map((r) => r.code);
