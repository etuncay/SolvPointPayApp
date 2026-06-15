import { approvalsService } from '@/features/approval-pool/api';
import { FX_MARGIN_HISTORY_SEED } from '@/mocks/fx-margin-history';
import { FX_MARGINS_SEED } from '@/mocks/fx-margins';
import { FX_RATES_SEED } from '@/mocks/fx-rates';
import { fetchTcmbRates } from '@/mocks/tcmb-rates-fixture';
import type { BackOfficeRole } from '@epay/ui';
import { computeMarginedPair } from '../domain/compute-margined-rates';
import { getFxPermissions } from '../domain/permissions';
import type {
  FxManagementSnapshot,
  FxMargin,
  FxMarginDraft,
  FxMarginHistory,
  FxMarginRow,
  FxRate,
  FxRateFilters,
  FxRefreshResult,
  FxSubmitMarginsResult,
} from '../domain/types';
import { validateFxMarginDraft } from '../domain/validation';
import { todayRateDate } from '../domain/work-hours';
import {
  createFxMarginApprovalRequest,
  parseFxMarginApprovalMeta,
  registerFxMarginApprovalApply,
} from './approval-bridge';
import type { FxService } from './fx-service';

let marginStore: FxMargin[] = FX_MARGINS_SEED.map((m) => ({ ...m }));
let rateStore: FxRate[] = FX_RATES_SEED.map((r) => ({ ...r }));
let historyStore: FxMarginHistory[] = FX_MARGIN_HISTORY_SEED.map((h) => ({ ...h }));
let nextHistId = 100;

function nowTs(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function marginRow(m: FxMargin): FxMarginRow {
  const {
    currency,
    workHours,
    buyFixedMargin,
    buyVariableMarginPct,
    sellFixedMargin,
    sellVariableMarginPct,
    roundingDecimals,
  } = m;
  return {
    currency,
    workHours,
    buyFixedMargin,
    buyVariableMarginPct,
    sellFixedMargin,
    sellVariableMarginPct,
    roundingDecimals,
  };
}

function findMargin(currency: FxMargin['currency'], workHours: FxMargin['workHours']): FxMargin {
  return marginStore.find((m) => m.currency === currency && m.workHours === workHours)!;
}

function recalcAllRates(): void {
  rateStore = rateStore.map((rate) => {
    const inside = marginRow(findMargin(rate.currency, 'Inside'));
    const outside = marginRow(findMargin(rate.currency, 'Outside'));
    const margined = computeMarginedPair(rate.buyRate, rate.sellRate, inside, outside);
    return { ...rate, ...margined, lastUpdated: nowTs() };
  });
}

function getPendingApprovalId(): number | null {
  const pending = marginStore.find((m) => m.pendingApprovalId != null);
  return pending?.pendingApprovalId ?? null;
}

function getPendingApprovalRef(id: number | null): string | null {
  if (id == null) return null;
  const approval = approvalsService.getById(id);
  return approval?.referenceNo ?? null;
}

function applyApprovedMargins(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval) return;
  const meta = parseFxMarginApprovalMeta(approval);
  if (!meta) return;

  const at = nowTs();
  const approvalRef = approval.referenceNo;

  marginStore = marginStore.map((m) => {
    const next = meta.draft.rows.find((r) => r.currency === m.currency && r.workHours === m.workHours);
    if (!next) return { ...m, pendingApprovalId: null };
    return {
      ...m,
      ...next,
      effectiveFrom: at,
      pendingApprovalId: null,
    };
  });

  for (const row of meta.draft.rows) {
    historyStore = [
      {
        id: `fxmh-${nextHistId++}`,
        at,
        currency: row.currency,
        workHours: row.workHours,
        buyFixedMargin: row.buyFixedMargin,
        buyVariableMarginPct: row.buyVariableMarginPct,
        sellFixedMargin: row.sellFixedMargin,
        sellVariableMarginPct: row.sellVariableMarginPct,
        roundingDecimals: row.roundingDecimals,
        approvalRef,
      },
      ...historyStore,
    ];
  }

  recalcAllRates();
}

registerFxMarginApprovalApply(applyApprovedMargins);

export const mockFxAdapter: FxService = {
  getSnapshot(role, rateFilters) {
    const p = getFxPermissions(role);
    if (!p.view) {
      return {
        margins: [],
        rates: [],
        marginHistory: [],
        rateHistory: [],
        pendingApprovalId: null,
        pendingApprovalRef: null,
      };
    }

    const today = todayRateDate();
    const dateFilter = rateFilters?.rateDate || today;
    let currentRates = rateStore.filter((r) => r.rateDate === today);
    if (currentRates.length === 0) {
      const latestDate = rateStore.reduce((max, r) => (r.rateDate > max ? r.rateDate : max), '');
      currentRates = rateStore.filter((r) => r.rateDate === latestDate);
    }
    const rateHistory = rateStore
      .filter((r) => r.rateDate === dateFilter)
      .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));

    const pendingApprovalId = getPendingApprovalId();

    return {
      margins: marginStore.map((m) => ({ ...m })),
      rates: currentRates.length > 0 ? currentRates : rateStore.filter((r) => r.rateDate === today),
      marginHistory: [...historyStore].sort((a, b) => b.at.localeCompare(a.at)),
      rateHistory,
      pendingApprovalId,
      pendingApprovalRef: getPendingApprovalRef(pendingApprovalId),
    };
  },

  refreshRates(role) {
    const p = getFxPermissions(role);
    if (!p.refreshRates) return { ok: false, error: 'fx_refresh_forbidden' };

    const fetched = fetchTcmbRates();
    const today = todayRateDate();
    const ts = nowTs();

    if (!fetched.ok) {
      const hasRates = rateStore.length > 0;
      if (!hasRates) return { ok: false, error: 'fx_refresh_failed' };
      return { ok: true, updated: 0, usedFallback: true };
    }

    let updated = 0;
    for (const quote of fetched.rates) {
      const idx = rateStore.findIndex((r) => r.currency === quote.currency && r.rateDate === today);
      const inside = marginRow(findMargin(quote.currency, 'Inside'));
      const outside = marginRow(findMargin(quote.currency, 'Outside'));
      const margined = computeMarginedPair(quote.buyRate, quote.sellRate, inside, outside);
      const base = {
        rateDate: today,
        currency: quote.currency,
        source: 'TCMB' as const,
        buyRate: quote.buyRate,
        sellRate: quote.sellRate,
        ...margined,
        lastUpdated: ts,
      };
      if (idx >= 0) {
        rateStore[idx] = { ...rateStore[idx]!, ...base };
      } else {
        rateStore = [
          {
            id: `fxr-${quote.currency.toLowerCase()}-${today}`,
            ...base,
          },
          ...rateStore,
        ];
      }
      updated += 1;
    }

    return { ok: true, updated, usedFallback: false };
  },

  submitMargins(draft, role) {
    const p = getFxPermissions(role);
    if (!p.editMargins) return { ok: false, error: 'fx_forbidden' };

    if (getPendingApprovalId() != null) return { ok: false, error: 'fx_pending_approval' };

    const validation = validateFxMarginDraft(draft);
    if (!validation.ok) {
      return {
        ok: false,
        error: validation.error,
        field: validation.field,
      };
    }

    const result = createFxMarginApprovalRequest(marginStore, draft, role);
    if (!result.ok || !result.approvalId) {
      return { ok: false, error: 'fx_approval_failed' };
    }

    marginStore = marginStore.map((m) => ({ ...m, pendingApprovalId: result.approvalId! }));
    return { ok: true, approvalId: result.approvalId };
  },

  resetForTests() {
    marginStore = FX_MARGINS_SEED.map((m) => ({ ...m }));
    rateStore = FX_RATES_SEED.map((r) => ({ ...r }));
    historyStore = FX_MARGIN_HISTORY_SEED.map((h) => ({ ...h }));
    nextHistId = 100;
  },
};

export function getFxMarginStoreSnapshot(): FxMargin[] {
  return marginStore.map((m) => ({ ...m }));
}

export function getFxRatesStoreSnapshot(): FxRate[] {
  return rateStore.map((r) => ({ ...r }));
}
