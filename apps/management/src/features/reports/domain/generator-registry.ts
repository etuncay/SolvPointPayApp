import * as masak from '../generators/masak';
import * as operational from '../generators/operational';
import * as tcmb from '../generators/tcmb';
import { ALL_REPORT_CODES, type ReportCode } from './report-codes';
import type { ReportGenerator } from './types';

const REGISTRY: Record<ReportCode, ReportGenerator> = {
  financial_transactions: operational.financialTransactions,
  error_transactions: operational.errorTransactions,
  risk_compliance_summary: operational.riskComplianceSummary,
  agent_accounts: operational.agentAccounts,
  rejected_cancelled_corrections: operational.rejectedCanceledCorrections,
  system_errors: operational.systemErrors,
  daily_commission_fees: tcmb.dailyCommissionFees,
  daily_reconciliation_inventory: tcmb.dailyReconciliationInventory,
  protection_account: tcmb.protectionAccount,
  transaction_volume_stats: tcmb.transactionVolumeStats,
  entity_kyc_summary: tcmb.entityKycSummary,
  str_output: masak.strOutput,
  info_document_response_pack: masak.infoDocumentResponsePack,
  asset_freeze_sanctions_summary: masak.assetFreezeSanctionsSummary,
};

export function getReportGenerator(code: ReportCode): ReportGenerator | null {
  return REGISTRY[code] ?? null;
}

export function registeredReportCodes(): ReportCode[] {
  return ALL_REPORT_CODES.filter((c) => REGISTRY[c] != null);
}
