import { getScreenById } from '@/features/system/shared/screen-registry';
import type { ValidateFieldRuleInput, ValidateFieldRuleResult } from './types';

const KNOWN_FIELDS = new Set([
  'amount',
  'currencyCode',
  'commissionRate',
  'variableFeePct',
  'dailyLimit',
  'fixedFee',
  'lowerLimit',
  'status',
  'balance',
]);

const CONDITION_RE =
  /^(\w+)\s*(==|!=|>|<|>=|<=)\s*('([^']*)'|"([^"]*)"|([\d.]+))$/;

export function validateFieldRuleExpression(
  input: ValidateFieldRuleInput,
): ValidateFieldRuleResult {
  const errors: string[] = [];
  const screen = getScreenById(input.screenId);
  if (!screen) errors.push('ar_validate_unknown_screen');
  if (!input.fieldName.trim()) {
    errors.push('ar_validate_field_required');
  } else if (!KNOWN_FIELDS.has(input.fieldName.trim())) {
    errors.push('ar_validate_unknown_field');
  }
  const cond = input.specialCondition?.trim();
  if (cond) {
    if (!CONDITION_RE.test(cond)) {
      errors.push('rs_dsl_invalid');
    }
  }
  return { ok: errors.length === 0, errors };
}
