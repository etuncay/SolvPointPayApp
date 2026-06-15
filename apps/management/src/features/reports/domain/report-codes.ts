export const OPERATIONAL_REPORT_CODES = [
  'financial_transactions',
  'error_transactions',
  'risk_compliance_summary',
  'agent_accounts',
  'rejected_cancelled_corrections',
  'system_errors',
] as const;

export const TCMB_REPORT_CODES = [
  'daily_commission_fees',
  'daily_reconciliation_inventory',
  'protection_account',
  'transaction_volume_stats',
  'entity_kyc_summary',
] as const;

export const MASAK_REPORT_CODES = [
  'str_output',
  'info_document_response_pack',
  'asset_freeze_sanctions_summary',
] as const;

export const ALL_REPORT_CODES = [
  ...OPERATIONAL_REPORT_CODES,
  ...TCMB_REPORT_CODES,
  ...MASAK_REPORT_CODES,
] as const;

export type ReportCode = (typeof ALL_REPORT_CODES)[number];

export type ReportCategory = 'operational' | 'tcmb' | 'masak';

export function reportCategory(code: ReportCode): ReportCategory {
  if ((OPERATIONAL_REPORT_CODES as readonly string[]).includes(code)) return 'operational';
  if ((TCMB_REPORT_CODES as readonly string[]).includes(code)) return 'tcmb';
  return 'masak';
}
