import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { ReportCode } from './types';
import { REPORT_CODES } from './types';

/** Dashboard panelleri — compliance ve yönetim tüm raporlar (spec §3) */
export function getVisibleReportCodes(role: BackOfficeRole): ReportCode[] {
  if (isAllAccessRole(role)) {
    return [...REPORT_CODES];
  }
  if (role === 'compliance' || role === 'management') {
    return [...REPORT_CODES];
  }
  return [];
}

export function canSeeRiskDashboard(role: BackOfficeRole): boolean {
  return getVisibleReportCodes(role).length > 0;
}
