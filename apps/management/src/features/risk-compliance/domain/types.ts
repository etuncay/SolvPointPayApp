/** Rapor panel kodları — spec §5 */
export type ReportCode =
  | 'case_age'
  | 'customers'
  | 'agents'
  | 'rule_performance'
  | 'staff_performance'
  | 'high_risk_approved';

export const REPORT_CODES: ReportCode[] = [
  'case_age',
  'customers',
  'agents',
  'rule_performance',
  'staff_performance',
  'high_risk_approved',
];

export type CaseAgeBucket = '0_1' | '1_5' | '5_10' | 'gt_10';

export type CaseAgeSummary = Record<CaseAgeBucket, number>;

export type PartyReportRow = {
  partyNo: string;
  name: string;
  caseCount: number;
  blockedTxCount: number;
  riskScore: number;
  disputeCount: number;
};

export type RulePerformanceRow = {
  ruleName: string;
  alarmCount: number;
  casesOpened: number;
  truePositive: number;
  tpRate: number;
  avgCloseDays: number;
};

export type StaffPerformanceRow = {
  staffName: string;
  casesHandled: number;
  escalations: number;
  rejections: number;
  approvals: number;
  closedWorkloadTry: number;
};

export type HighRiskApprovedRow = {
  txNo: string;
  date: string;
  customerName: string;
  amount: number;
  currency: 'TRY';
  riskScore: number;
  approvedBy: string;
  description: string;
};

export type ReportTableData =
  | PartyReportRow[]
  | RulePerformanceRow[]
  | StaffPerformanceRow[]
  | HighRiskApprovedRow[];

export type PanelState<T> =
  | { status: 'loading' }
  | { status: 'error'; message?: string }
  | { status: 'ready'; data: T; refreshedAt: Date };

export type RiskDashboardPanels = {
  case_age?: PanelState<CaseAgeSummary>;
  customers?: PanelState<PartyReportRow[]>;
  agents?: PanelState<PartyReportRow[]>;
  rule_performance?: PanelState<RulePerformanceRow[]>;
  staff_performance?: PanelState<StaffPerformanceRow[]>;
  high_risk_approved?: PanelState<HighRiskApprovedRow[]>;
};

export type ReportSort = { column: string; direction: 'asc' | 'desc' };

export type ReportFilters = {
  search?: string;
  sort?: ReportSort;
};

export type RiskAccessLogEntry = {
  at: string;
  action: 'dashboard' | 'report';
  reportCode?: ReportCode;
};
