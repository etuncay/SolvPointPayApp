import { describe, expect, it } from 'vitest';
import { FX_MARGINS_SEED } from '@/mocks/fx-margins';
import { validateFxMarginDraft, validateWorkHoursMargins } from './validation';
import type { FxMarginRow } from './types';

function rowsFromSeed(): FxMarginRow[] {
  return FX_MARGINS_SEED.map(({ currency, workHours, buyFixedMargin, buyVariableMarginPct, sellFixedMargin, sellVariableMarginPct, roundingDecimals }) => ({
    currency,
    workHours,
    buyFixedMargin,
    buyVariableMarginPct,
    sellFixedMargin,
    sellVariableMarginPct,
    roundingDecimals,
  }));
}

describe('validateWorkHoursMargins', () => {
  it('geçerli seed OK', () => {
    expect(validateWorkHoursMargins(rowsFromSeed()).ok).toBe(true);
  });

  it('outside < inside fail', () => {
    const rows = rowsFromSeed();
    const usdOut = rows.find((r) => r.currency === 'USD' && r.workHours === 'Outside')!;
    usdOut.buyFixedMargin = 0;
    expect(validateWorkHoursMargins(rows)).toEqual({
      ok: false,
      error: 'fx_outside_below_inside',
      field: 'USD.buyFixedMargin',
    });
  });

  it('negatif marj OK', () => {
    const rows = rowsFromSeed().map((r) => ({ ...r, buyFixedMargin: -1, sellFixedMargin: -0.5 }));
    const usdIn = rows.find((r) => r.currency === 'USD' && r.workHours === 'Inside')!;
    const usdOut = rows.find((r) => r.currency === 'USD' && r.workHours === 'Outside')!;
    usdOut.buyFixedMargin = usdIn.buyFixedMargin;
    usdOut.buyVariableMarginPct = usdIn.buyVariableMarginPct;
    usdOut.sellFixedMargin = usdIn.sellFixedMargin;
    usdOut.sellVariableMarginPct = usdIn.sellVariableMarginPct;
    expect(validateFxMarginDraft({ rows }).ok).toBe(true);
  });
});
