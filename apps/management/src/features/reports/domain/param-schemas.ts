import type { ReportCode } from './report-codes';
import type { ReportParams } from './types';
import { TCMB_REPORT_CODES } from './report-codes';

const MAX_RANGE_DAYS = 93;

export function validateReportParams(
  code: ReportCode,
  params: ReportParams,
): { ok: true; params: ReportParams } | { ok: false; errorCode: string } {
  const needsDaily = (TCMB_REPORT_CODES as readonly string[]).includes(code) &&
    ['daily_commission_fees', 'daily_reconciliation_inventory', 'protection_account'].includes(code);

  if (needsDaily) {
    if (!params.reportDate?.trim()) return { ok: false, errorCode: 'rpt_report_date_required' };
    return { ok: true, params: { reportDate: params.reportDate.trim() } };
  }

  const from = params.dateFrom?.trim();
  const to = params.dateTo?.trim();
  if (!from || !to) return { ok: false, errorCode: 'rpt_date_range_required' };
  if (from > to) return { ok: false, errorCode: 'rpt_date_range_invalid' };
  const days =
    (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000;
  if (days > MAX_RANGE_DAYS) return { ok: false, errorCode: 'rpt_date_range_too_long' };

  return {
    ok: true,
    params: {
      dateFrom: from,
      dateTo: to,
      currency: params.currency?.trim() || undefined,
      channel: params.channel?.trim() || undefined,
      entityType: params.entityType?.trim() || undefined,
    },
  };
}
