import type { BackOfficeRole } from '@epay/ui';
import { buildCaseAgeSummary } from '../domain/case-age-buckets';
import { getVisibleReportCodes } from '../domain/report-permissions';
import type {
  HighRiskApprovedRow,
  PartyReportRow,
  ReportCode,
  ReportFilters,
  RiskAccessLogEntry,
  RiskDashboardPanels,
  RulePerformanceRow,
  StaffPerformanceRow,
} from '../domain/types';
import { OPEN_RISK_CASES } from '@/mocks/risk-cases';
import {
  AGENT_REPORT_ROWS,
  CUSTOMER_REPORT_ROWS,
  HIGH_RISK_APPROVED_ROWS,
  RULE_PERFORMANCE_ROWS,
  STAFF_PERFORMANCE_ROWS,
} from '@/mocks/risk-dashboard-reports';
import type { RiskCompliancePort } from './risk-compliance-service';

let accessLog: RiskAccessLogEntry[] = [];
let simulateErrorCode: ReportCode | null = null;

function log(action: RiskAccessLogEntry['action'], reportCode?: ReportCode) {
  accessLog = [
    ...accessLog,
    { at: new Date().toISOString(), action, reportCode },
  ];
}

function delay(ms = 80): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPanel<T>(code: ReportCode, loader: () => T): Promise<T> {
  await delay();
  if (simulateErrorCode === code) {
    throw new Error(`Simulated panel error: ${code}`);
  }
  log('report', code);
  return loader();
}

function sortPartyRows(rows: PartyReportRow[], filters?: ReportFilters): PartyReportRow[] {
  let out = [...rows];
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    out = out.filter(
      (r) => r.name.toLowerCase().includes(q) || r.partyNo.toLowerCase().includes(q),
    );
  }
  const col = filters?.sort?.column ?? 'disputeCount';
  const dir = filters?.sort?.direction ?? 'desc';
  out.sort((a, b) => {
    const av = a[col as keyof PartyReportRow];
    const bv = b[col as keyof PartyReportRow];
    const cmp =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
    return dir === 'asc' ? cmp : -cmp;
  });
  return out;
}

function sortRuleRows(rows: RulePerformanceRow[], filters?: ReportFilters): RulePerformanceRow[] {
  let out = [...rows];
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    out = out.filter((r) => r.ruleName.toLowerCase().includes(q));
  }
  const col = filters?.sort?.column ?? 'alarmCount';
  const dir = filters?.sort?.direction ?? 'desc';
  out.sort((a, b) => {
    const av = a[col as keyof RulePerformanceRow];
    const bv = b[col as keyof RulePerformanceRow];
    const cmp =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
    return dir === 'asc' ? cmp : -cmp;
  });
  return out;
}

function sortStaffRows(rows: StaffPerformanceRow[], filters?: ReportFilters): StaffPerformanceRow[] {
  let out = [...rows];
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    out = out.filter((r) => r.staffName.toLowerCase().includes(q));
  }
  const col = filters?.sort?.column ?? 'casesHandled';
  const dir = filters?.sort?.direction ?? 'desc';
  out.sort((a, b) => {
    const av = a[col as keyof StaffPerformanceRow];
    const bv = b[col as keyof StaffPerformanceRow];
    const cmp =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
    return dir === 'asc' ? cmp : -cmp;
  });
  return out;
}

function sortHighRiskRows(rows: HighRiskApprovedRow[], filters?: ReportFilters): HighRiskApprovedRow[] {
  let out = [...rows];
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    out = out.filter(
      (r) =>
        r.txNo.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.approvedBy.toLowerCase().includes(q),
    );
  }
  const col = filters?.sort?.column ?? 'date';
  const dir = filters?.sort?.direction ?? 'desc';
  out.sort((a, b) => {
    const av = a[col as keyof HighRiskApprovedRow];
    const bv = b[col as keyof HighRiskApprovedRow];
    const cmp =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
    return dir === 'asc' ? cmp : -cmp;
  });
  return out;
}

export const mockRiskComplianceAdapter: RiskCompliancePort = {
  async getDashboard(role, options) {
    simulateErrorCode = options?.simulateError ?? null;
    log('dashboard');

    const codes = getVisibleReportCodes(role);
    const panels: RiskDashboardPanels = {};
    const now = new Date();

    await Promise.all(
      codes.map(async (code) => {
        try {
          if (code === 'case_age') {
            const data = await fetchPanel(code, () =>
              buildCaseAgeSummary(OPEN_RISK_CASES, now),
            );
            panels.case_age = { status: 'ready', data, refreshedAt: now };
          } else if (code === 'customers') {
            const data = await fetchPanel(code, () => CUSTOMER_REPORT_ROWS);
            panels.customers = { status: 'ready', data, refreshedAt: now };
          } else if (code === 'agents') {
            const data = await fetchPanel(code, () => AGENT_REPORT_ROWS);
            panels.agents = { status: 'ready', data, refreshedAt: now };
          } else if (code === 'rule_performance') {
            const data = await fetchPanel(code, () => RULE_PERFORMANCE_ROWS);
            panels.rule_performance = { status: 'ready', data, refreshedAt: now };
          } else if (code === 'staff_performance') {
            const data = await fetchPanel(code, () => STAFF_PERFORMANCE_ROWS);
            panels.staff_performance = { status: 'ready', data, refreshedAt: now };
          } else if (code === 'high_risk_approved') {
            const data = await fetchPanel(code, () => HIGH_RISK_APPROVED_ROWS);
            panels.high_risk_approved = { status: 'ready', data, refreshedAt: now };
          }
        } catch {
          const key = code as keyof RiskDashboardPanels;
          panels[key] = { status: 'error', message: 'load_failed' };
        }
      }),
    );

    simulateErrorCode = null;
    return panels;
  },

  async getReport(code, role, filters) {
    const visible = getVisibleReportCodes(role);
    if (!visible.includes(code)) {
      throw new Error('Forbidden');
    }
    await delay(60);
    log('report', code);

    switch (code) {
      case 'case_age':
        return buildCaseAgeSummary(OPEN_RISK_CASES) as never;
      case 'customers':
        return sortPartyRows(CUSTOMER_REPORT_ROWS, filters) as never;
      case 'agents':
        return sortPartyRows(AGENT_REPORT_ROWS, filters) as never;
      case 'rule_performance':
        return sortRuleRows(RULE_PERFORMANCE_ROWS, filters) as never;
      case 'staff_performance':
        return sortStaffRows(STAFF_PERFORMANCE_ROWS, filters) as never;
      case 'high_risk_approved':
        return sortHighRiskRows(HIGH_RISK_APPROVED_ROWS, filters) as never;
      default:
        throw new Error(`Unknown report: ${code}`);
    }
  },

  getAccessLog() {
    return [...accessLog];
  },

  resetForTests() {
    accessLog = [];
    simulateErrorCode = null;
  },
};
