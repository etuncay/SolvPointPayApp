/** 8.5 finansal mutabakat — reconciliation_status (Unmatched yalnızca 6.4) */
export type FinReconStatus = 'Matched' | 'PendingReview' | 'Adjusted';

export type FinancialReconciliation = {
  id: string;
  asOfTimestamp: string;
  inventoryBalance: number;
  accountingBalance: number;
  bankTotalBalance: number;
  diffInventoryAccounting: number;
  diffInventoryBank: number;
  status: FinReconStatus;
  description: string | null;
  createdAt: string;
};

export type FinancialReconciliationFilters = {
  status: FinReconStatus | 'all';
  asOfFrom: string;
  asOfTo: string;
};

export const DEFAULT_FIN_RECON_FILTERS: FinancialReconciliationFilters = {
  status: 'all',
  asOfFrom: '',
  asOfTo: '',
};

export const FIN_RECON_STATUS_OPTIONS: FinReconStatus[] = ['Matched', 'PendingReview', 'Adjusted'];

export type FinancialReconciliationPermissions = {
  list: boolean;
  view: boolean;
  run: boolean;
  adjust: boolean;
};

export type FinancialReconciliationRunResult =
  | { ok: true; row: FinancialReconciliation }
  | { ok: false; error: 'finrec_snapshot_failed' | 'br_run_forbidden' };

export type FinancialReconciliationAdjustResult =
  | { ok: true; row: FinancialReconciliation }
  | {
      ok: false;
      error:
        | 'finrec_not_found'
        | 'finrec_invalid_status'
        | 'finrec_description_required'
        | 'finrec_adjust_forbidden';
    };

export type BalanceSources = {
  inventoryBalance: number;
  accountingBalance: number;
  bankTotalBalance: number;
};
