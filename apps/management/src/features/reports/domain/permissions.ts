import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import {
  MASAK_REPORT_CODES,
  OPERATIONAL_REPORT_CODES,
  TCMB_REPORT_CODES,
  type ReportCode,
} from './report-codes';
import type { ReportDefinition } from './types';

const COMPLIANCE_OPERATIONAL: ReportCode[] = ['risk_compliance_summary'];

export function canViewReportCatalog(role: BackOfficeRole): boolean {
  return (
    role === 'finance' || role === 'compliance' || role === 'management' || isAllAccessRole(role)
  );
}

export function canGenerateReport(role: BackOfficeRole, code: ReportCode): boolean {
  if (!canViewReportCatalog(role)) return false;
  if (role === 'management' || isAllAccessRole(role)) return true;
  if (role === 'finance') {
    return !(MASAK_REPORT_CODES as readonly string[]).includes(code);
  }
  if (role === 'compliance') {
    if ((MASAK_REPORT_CODES as readonly string[]).includes(code)) return true;
    if ((TCMB_REPORT_CODES as readonly string[]).includes(code)) return true;
    return COMPLIANCE_OPERATIONAL.includes(code);
  }
  return false;
}

export function filterCatalogByRole(
  role: BackOfficeRole,
  catalog: ReportDefinition[],
): ReportDefinition[] {
  return catalog.filter((d) => canGenerateReport(role, d.code));
}

export function visibleCategories(role: BackOfficeRole): ('operational' | 'tcmb' | 'masak')[] {
  if (!canViewReportCatalog(role)) return [];
  if (role === 'management' || isAllAccessRole(role)) return ['operational', 'tcmb', 'masak'];
  if (role === 'finance') return ['operational', 'tcmb'];
  if (role === 'compliance') return ['operational', 'tcmb', 'masak'];
  return [];
}
