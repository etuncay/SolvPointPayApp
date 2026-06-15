/** MVP BTRANS rapor tipleri — spec §19 */
export const BTRANS_REPORT_CATALOG = [
  { code: 'EPAY_DAILY_TX', period: 'daily' as const },
  { code: 'EPAY_MONTHLY_AGG', period: 'monthly' as const },
  { code: 'EPAY_SUSPICIOUS', period: 'event' as const },
] as const;

export type BtransReportName = (typeof BTRANS_REPORT_CATALOG)[number]['code'];

export function isBtransReportName(value: string): value is BtransReportName {
  return BTRANS_REPORT_CATALOG.some((r) => r.code === value);
}
