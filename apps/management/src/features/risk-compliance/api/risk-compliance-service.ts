import type { BackOfficeRole } from '@epay/ui';
import type {
  CaseAgeSummary,
  HighRiskApprovedRow,
  PartyReportRow,
  ReportCode,
  ReportFilters,
  RiskAccessLogEntry,
  RiskDashboardPanels,
  RulePerformanceRow,
  StaffPerformanceRow,
} from '../domain/types';

export type RiskCompliancePort = {
  getDashboard(role: BackOfficeRole, options?: { simulateError?: ReportCode }): Promise<RiskDashboardPanels>;
  getReport<T>(
    code: ReportCode,
    role: BackOfficeRole,
    filters?: ReportFilters,
  ): Promise<T>;
  getAccessLog(): RiskAccessLogEntry[];
  resetForTests(): void;
};

let port: RiskCompliancePort | null = null;

export function setRiskCompliancePort(next: RiskCompliancePort) {
  port = next;
}

function getPort(): RiskCompliancePort {
  if (!port) {
    throw new Error('RiskCompliancePort not configured');
  }
  return port;
}

export const riskComplianceService = {
  getDashboard(role: BackOfficeRole, options?: { simulateError?: ReportCode }) {
    return getPort().getDashboard(role, options);
  },
  getReport<T>(code: ReportCode, role: BackOfficeRole, filters?: ReportFilters) {
    return getPort().getReport<T>(code, role, filters);
  },
  getAccessLog() {
    return getPort().getAccessLog();
  },
  resetForTests() {
    getPort().resetForTests();
  },
};

export type {
  CaseAgeSummary,
  HighRiskApprovedRow,
  PartyReportRow,
  ReportCode,
  RiskDashboardPanels,
  RulePerformanceRow,
  StaffPerformanceRow,
};
