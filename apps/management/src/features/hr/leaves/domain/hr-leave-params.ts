import { getParameterValue } from '@/mocks/system-parameters';
import { TR_PUBLIC_HOLIDAYS_2026 } from '@/mocks/tr-public-holidays';

export interface HrLeaveParams {
  annualEntitlementDays: number;
  sickLeaveLimitDaysPerYear: number;
  leaveReportMaxRows: number;
  publicHolidays: string[];
}

function parseHolidayParam(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) return parsed;
  } catch {
    /* catalog fallback */
  }
  return TR_PUBLIC_HOLIDAYS_2026;
}

export function getHrLeaveParams(): HrLeaveParams {
  const holidayRaw = getParameterValue('hr.public_holidays', JSON.stringify(TR_PUBLIC_HOLIDAYS_2026));
  return {
    annualEntitlementDays: getParameterValue('hr.annual_entitlement_days', 14),
    sickLeaveLimitDaysPerYear: getParameterValue('hr.sick_leave_limit_days', 10),
    leaveReportMaxRows: getParameterValue('hr.leave_report_max_rows', 500),
    publicHolidays: parseHolidayParam(holidayRaw),
  };
}
