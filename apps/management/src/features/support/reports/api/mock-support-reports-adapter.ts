import type { BackOfficeRole } from '@epay/ui';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { getSupportCasesStore } from '@/mocks/support-cases-store';
import { aggregateAgentsByCases } from '../domain/aggregate-agents-by-cases';
import { aggregateByCaseAge } from '../domain/aggregate-by-case-age';
import { aggregateByComplaintType } from '../domain/aggregate-by-complaint-type';
import { aggregateCustomersByCases } from '../domain/aggregate-customers-by-cases';
import { ALL_REPORT_CODES } from '../domain/report-codes';
import { getSupportReportPermissions } from '../domain/permissions';
import type {
  PanelResult,
  ReportCode,
  SupportReportAccessLogEntry,
  SupportReportBundle,
} from '../domain/types';
import type { SupportReportsService } from './support-reports-service';

let accessLog: SupportReportAccessLogEntry[] = [];
let simulateErrorCode: ReportCode | null = null;

function log(
  action: SupportReportAccessLogEntry['action'],
  role: BackOfficeRole,
  userId: string,
  reportCode?: ReportCode,
) {
  accessLog = [
    ...accessLog,
    { at: new Date('2026-05-24T12:00:00Z').toISOString(), action, reportCode, role, userId },
  ];
}

function delay(ms = 40): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function loadPanel<T>(code: ReportCode, loader: () => T): Promise<PanelResult<T>> {
  await delay();
  if (simulateErrorCode === code) {
    return { ok: false, errorCode: 'scr_panel_error' };
  }
  return { ok: true, data: loader(), refreshedAt: new Date('2026-05-24T12:00:00Z').toISOString() };
}

function casesSource() {
  return getSupportCasesStore();
}

export const supportReportsService: SupportReportsService = {
  async getAll(role, userId, options) {
    if (!getSupportReportPermissions(role).canView) {
      throw new Error('scr_forbidden');
    }
    simulateErrorCode = options?.simulateError ?? null;
    log('view_bundle', role, userId);

    const panels: SupportReportBundle['panels'] = {};
    const cases = casesSource();
    const now = new Date('2026-05-24T12:00:00Z');

    await Promise.all(
      ALL_REPORT_CODES.map(async (code) => {
        try {
          if (code === 'by-complaint-type') {
            panels[code] = await loadPanel(code, () => aggregateByComplaintType(cases));
          } else if (code === 'by-case-age') {
            panels[code] = await loadPanel(code, () => aggregateByCaseAge(cases, now));
          } else if (code === 'customers-by-cases') {
            panels[code] = await loadPanel(code, () => aggregateCustomersByCases(cases, now));
          } else if (code === 'agents-by-cases') {
            panels[code] = await loadPanel(code, () => aggregateAgentsByCases(cases, now));
          }
        } catch {
          panels[code] = { ok: false, errorCode: 'scr_panel_error' };
        }
      }),
    );

    simulateErrorCode = null;
    return { panels };
  },

  async getByCode(role, userId, code) {
    if (!getSupportReportPermissions(role).canView) {
      throw new Error('scr_forbidden');
    }
    log('view_panel', role, userId, code);
    const bundle = await this.getAll(role, userId);
    return bundle.panels[code];
  },

  getAccessLog() {
    return accessLog.map(({ at, action, reportCode }) => ({ at, action, reportCode }));
  },

  resetForTests() {
    accessLog = [];
    simulateErrorCode = null;
  },

  setSimulateError(code) {
    simulateErrorCode = code;
  },
};

export function loadSupportReportsForCurrentRole(role: BackOfficeRole) {
  const user = getCurrentUser(role);
  return supportReportsService.getAll(role, user.id);
}
