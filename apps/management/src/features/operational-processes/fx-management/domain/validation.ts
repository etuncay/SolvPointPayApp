import { z } from 'zod';
import type { FxCurrency, FxMarginDraft, FxMarginRow, WorkHours } from './types';

const marginRowSchema = z.object({
  currency: z.enum(['USD', 'EUR']),
  workHours: z.enum(['Inside', 'Outside']),
  buyFixedMargin: z.number(),
  buyVariableMarginPct: z.number(),
  sellFixedMargin: z.number(),
  sellVariableMarginPct: z.number(),
  roundingDecimals: z.number().int().min(0).max(6),
});

export const fxMarginDraftSchema = z.object({
  rows: z.array(marginRowSchema).length(4),
});

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: 'fx_outside_below_inside' | 'fx_validation_failed'; field?: string };

function rowKey(currency: FxCurrency, workHours: WorkHours) {
  return `${currency}:${workHours}`;
}

function findRow(rows: FxMarginRow[], currency: FxCurrency, workHours: WorkHours): FxMarginRow | undefined {
  return rows.find((r) => r.currency === currency && r.workHours === workHours);
}

const COMPARE_FIELDS: (keyof Pick<
  FxMarginRow,
  'buyFixedMargin' | 'buyVariableMarginPct' | 'sellFixedMargin' | 'sellVariableMarginPct'
>)[] = ['buyFixedMargin', 'buyVariableMarginPct', 'sellFixedMargin', 'sellVariableMarginPct'];

/** Mesai dışı marj bileşenleri ≥ mesai içi (§7) */
export function validateWorkHoursMargins(rows: FxMarginRow[]): ValidationResult {
  for (const currency of ['USD', 'EUR'] as FxCurrency[]) {
    const inside = findRow(rows, currency, 'Inside');
    const outside = findRow(rows, currency, 'Outside');
    if (!inside || !outside) return { ok: false, error: 'fx_validation_failed', field: rowKey(currency, 'Outside') };

    for (const field of COMPARE_FIELDS) {
      if (outside[field] < inside[field]) {
        return {
          ok: false,
          error: 'fx_outside_below_inside',
          field: `${currency}.${field}`,
        };
      }
    }
  }
  return { ok: true };
}

export function validateFxMarginDraft(draft: FxMarginDraft): ValidationResult {
  const parsed = fxMarginDraftSchema.safeParse(draft);
  if (!parsed.success) return { ok: false, error: 'fx_validation_failed' };
  return validateWorkHoursMargins(parsed.data.rows);
}
