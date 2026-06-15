import { describe, expect, it, beforeEach } from 'vitest';
import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { setTcmbSimulateError } from '@/mocks/tcmb-rates-fixture';
import { FX_MARGINS_SEED } from '@/mocks/fx-margins';
import { getFxMarginStoreSnapshot, mockFxAdapter } from './mock-fx-adapter';
import type { FxMarginDraft } from '../domain/types';

function draftFromSeed(): FxMarginDraft {
  return {
    rows: FX_MARGINS_SEED.map(
      ({
        currency,
        workHours,
        buyFixedMargin,
        buyVariableMarginPct,
        sellFixedMargin,
        sellVariableMarginPct,
        roundingDecimals,
      }) => ({
        currency,
        workHours,
        buyFixedMargin,
        buyVariableMarginPct,
        sellFixedMargin,
        sellVariableMarginPct,
        roundingDecimals,
      }),
    ),
  };
}

describe('mock-fx-adapter', () => {
  beforeEach(() => {
    mockFxAdapter.resetForTests();
    setTcmbSimulateError(false);
  });

  it('finance snapshot döner', () => {
    const snap = mockFxAdapter.getSnapshot('finance');
    expect(snap.margins).toHaveLength(4);
    expect(snap.rates.length).toBeGreaterThanOrEqual(2);
  });

  it('compliance erişemez', () => {
    const snap = mockFxAdapter.getSnapshot('compliance');
    expect(snap.margins).toEqual([]);
  });

  it('submit → onay bekler, marj değişmez', () => {
    const draft = draftFromSeed();
    const usdOut = draft.rows.find((r) => r.currency === 'USD' && r.workHours === 'Outside')!;
    usdOut.buyFixedMargin = 0.3;
    draft.rows.find((r) => r.currency === 'USD' && r.workHours === 'Inside')!.buyFixedMargin = 0.2;
    const result = mockFxAdapter.submitMargins(draft, 'finance');
    expect(result.ok).toBe(true);
    const beforeApprove = getFxMarginStoreSnapshot().find((m) => m.currency === 'USD' && m.workHours === 'Inside')!;
    expect(beforeApprove.buyFixedMargin).toBe(0.05);
    expect(beforeApprove.pendingApprovalId).toBeTruthy();
  });

  it('onay sonrası marj uygulanır', () => {
    const draft = draftFromSeed();
    draft.rows.find((r) => r.currency === 'USD' && r.workHours === 'Outside')!.buyFixedMargin = 0.35;
    draft.rows.find((r) => r.currency === 'USD' && r.workHours === 'Inside')!.buyFixedMargin = 0.25;
    const submit = mockFxAdapter.submitMargins(draft, 'finance');
    expect(submit.ok).toBe(true);
    if (!submit.ok) return;

    const user = getCurrentUser('compliance');
    const approve = approvalsService.approve(submit.approvalId, user, 'OK');
    expect(approve.ok).toBe(true);

    const after = getFxMarginStoreSnapshot().find((m) => m.currency === 'USD' && m.workHours === 'Inside')!;
    expect(after.buyFixedMargin).toBe(0.25);
    expect(after.pendingApprovalId).toBeNull();
  });

  it('refresh TCMB fail → fallback', () => {
    setTcmbSimulateError(true);
    const result = mockFxAdapter.refreshRates('finance');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.usedFallback).toBe(true);
  });

  it('outside < inside submit fail', () => {
    const draft = draftFromSeed();
    draft.rows.find((r) => r.currency === 'EUR' && r.workHours === 'Outside')!.buyFixedMargin = 0;
    const result = mockFxAdapter.submitMargins(draft, 'finance');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('fx_outside_below_inside');
  });
});
