import type { BackOfficeRole } from '@epay/ui';
import {
  appendReportArchive,
  getReportArchiveById,
  listReportArchive,
  resetReportArchiveStore,
} from '@/mocks/report-archive-store';
import { REPORT_CATALOG } from '../domain/report-catalog';
import { getReportGenerator } from '../domain/generator-registry';
import type { ReportCode } from '../domain/report-codes';
import { validateReportParams } from '../domain/param-schemas';
import { canGenerateReport, canViewReportCatalog, filterCatalogByRole } from '../domain/permissions';
import type { GenerateReportResult, ReportParams } from '../domain/types';
import type { ReportsService } from './reports-service';
import { correlationId } from '../generators/shared';

type AuditEntry = {
  at: string;
  action: 'generate' | 'export';
  reportCode?: ReportCode;
  correlationId?: string;
  userId?: string;
};

let auditLog: AuditEntry[] = [];

function log(entry: Omit<AuditEntry, 'at'>) {
  auditLog = [{ at: new Date('2026-05-24T12:00:00Z').toISOString(), ...entry }, ...auditLog];
}

export const reportsService: ReportsService = {
  getCatalog(role) {
    if (!canViewReportCatalog(role)) return [];
    return filterCatalogByRole(role, REPORT_CATALOG);
  },

  async generate(role, userId, code, params) {
    const cid = correlationId();
    if (!canGenerateReport(role, code)) {
      return { ok: false, errorCode: 'rpt_forbidden', correlationId: cid };
    }
    const validated = validateReportParams(code, params);
    if (!validated.ok) {
      return { ok: false, errorCode: validated.errorCode, correlationId: cid };
    }
    const generator = getReportGenerator(code);
    if (!generator) {
      return { ok: false, errorCode: 'rpt_unknown_report', correlationId: cid };
    }
    try {
      const result = await generator(validated.params, {
        role,
        userId,
        now: new Date('2026-05-24T12:00:00Z'),
      });
      const entry = appendReportArchive({
        reportCode: code,
        params: validated.params,
        result,
        generatedBy: userId,
      });
      log({ action: 'generate', reportCode: code, correlationId: result.correlationId, userId });
      return { ok: true, archiveId: entry.id, result };
    } catch {
      return { ok: false, errorCode: 'rpt_generate_failed', correlationId: cid };
    }
  },

  listArchive(role, reportCode, limit = 5) {
    if (!canViewReportCatalog(role)) return [];
    return listReportArchive(reportCode, limit);
  },

  getArchiveEntry(role, archiveId) {
    if (!canViewReportCatalog(role)) return null;
    return getReportArchiveById(archiveId);
  },

  getAccessLog() {
    return auditLog.map(({ at, action, reportCode, correlationId: cid }) => ({
      at,
      action,
      reportCode,
      correlationId: cid,
    }));
  },

  resetForTests() {
    auditLog = [];
    resetReportArchiveStore();
  },
};
