export type FxCurrency = 'USD' | 'EUR';

export type WorkHours = 'Inside' | 'Outside';

export const FX_CURRENCIES: FxCurrency[] = ['USD', 'EUR'];

export const WORK_HOURS_OPTIONS: WorkHours[] = ['Inside', 'Outside'];

export type FxMargin = {
  id: string;
  currency: FxCurrency;
  workHours: WorkHours;
  buyFixedMargin: number;
  buyVariableMarginPct: number;
  sellFixedMargin: number;
  sellVariableMarginPct: number;
  roundingDecimals: number;
  effectiveFrom: string;
  pendingApprovalId: number | null;
};

export type FxMarginRow = Pick<
  FxMargin,
  | 'currency'
  | 'workHours'
  | 'buyFixedMargin'
  | 'buyVariableMarginPct'
  | 'sellFixedMargin'
  | 'sellVariableMarginPct'
  | 'roundingDecimals'
>;

export type FxMarginDraft = {
  rows: FxMarginRow[];
};

export type FxRate = {
  id: string;
  rateDate: string;
  currency: FxCurrency;
  source: 'TCMB' | 'Manual';
  buyRate: number;
  sellRate: number;
  marginedBuyInside: number;
  marginedSellInside: number;
  marginedBuyOutside: number;
  marginedSellOutside: number;
  lastUpdated: string;
};

export type FxRateFilters = {
  rateDate: string;
};

export type FxMarginHistory = {
  id: string;
  at: string;
  currency: FxCurrency;
  workHours: WorkHours;
  buyFixedMargin: number;
  buyVariableMarginPct: number;
  sellFixedMargin: number;
  sellVariableMarginPct: number;
  roundingDecimals: number;
  approvalRef: string | null;
};

export type FxManagementSnapshot = {
  margins: FxMargin[];
  rates: FxRate[];
  marginHistory: FxMarginHistory[];
  rateHistory: FxRate[];
  pendingApprovalId: number | null;
  pendingApprovalRef: string | null;
};

export type FxPermissions = {
  view: boolean;
  editMargins: boolean;
  refreshRates: boolean;
};

export type FxRefreshResult =
  | { ok: true; updated: number; usedFallback?: boolean }
  | { ok: false; error: 'fx_refresh_forbidden' | 'fx_refresh_failed' };

export type FxSubmitMarginsResult =
  | { ok: true; approvalId: number }
  | {
      ok: false;
      error:
        | 'fx_forbidden'
        | 'fx_pending_approval'
        | 'fx_validation_failed'
        | 'fx_outside_below_inside'
        | 'fx_approval_failed';
      field?: string;
    };
