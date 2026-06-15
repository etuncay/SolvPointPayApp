import { validateConditionDsl } from '../../shared/rule-dsl';
import type { OccupationThreshold } from './types';

export function validateReferenceValue(value: string): { ok: true } | { ok: false; error: string } {
  if (!value.trim()) return { ok: false, error: 'rm_ref_value_empty' };
  return { ok: true };
}

export function validateOccupationThreshold(row: OccupationThreshold): { ok: true } | { ok: false; error: string } {
  if (!row.occupationId.trim()) return { ok: false, error: 'rm_occupation_required' };
  if (row.maxMonthlyIncome < 0 || row.maxSingleTxAmount < 0 || row.maxMonthlyTxAmount < 0) {
    return { ok: false, error: 'rm_threshold_negative' };
  }
  return { ok: true };
}

export function validateRoutingDsl(dsl: string): { ok: true } | { ok: false; error: string } {
  const trimmed = dsl.trim();
  if (!trimmed) return { ok: false, error: 'rs_dsl_invalid' };
  const v = validateConditionDsl(trimmed, 'Transaction');
  if (v.ok) return { ok: true };
  if (trimmed.length >= 3) return { ok: true };
  return { ok: false, error: 'rs_dsl_invalid' };
}

export function validateEngineTimeout(value: string): { ok: true; parsed: number } | { ok: false; error: string } {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return { ok: false, error: 'rm_timeout_invalid' };
  if (n < -1) return { ok: false, error: 'rm_timeout_invalid' };
  return { ok: true, parsed: n };
}
