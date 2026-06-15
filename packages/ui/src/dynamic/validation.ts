/* ──────────────────────────────────────────────────────
 *  Validation engine — sync + async rules
 * ────────────────────────────────────────────────────── */
import type { FieldConfig, FieldRule, CustomFunctions } from './types';
import { evaluateExpression, evalBool } from './expression';

/** Değer boş mu (required kontrolü için ortak yardımcı). */
function isEmpty(value: unknown): boolean {
  return value == null || value === '' || (Array.isArray(value) && value.length === 0);
}

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Validate a single field value against its rules.
 */
export function validateField(
  field: FieldConfig,
  value: unknown,
  allValues: Record<string, unknown>,
): string | undefined {
  // Koşullu zorunluluk: requiredRules ifadesi true ve değer boşsa hata ver.
  // (Statik rule.required'dan bağımsız; ifade değerlere göre çalışır.)
  if (field.requiredRules && evalBool(field.requiredRules, allValues) && isEmpty(value)) {
    const requiredMsg = field.rules?.find((r) => r.required)?.message;
    return requiredMsg ?? 'Bu alan zorunludur';
  }

  if (!field.rules?.length) return undefined;

  for (const rule of field.rules) {
    const err = applySyncRule(rule, value, allValues);
    if (err) return err;
  }
  return undefined;
}

function applySyncRule(
  rule: FieldRule,
  value: unknown,
  allValues: Record<string, unknown>,
): string | undefined {
  // Required
  if (rule.required) {
    if (isEmpty(value)) {
      return rule.message ?? 'Bu alan zorunludur';
    }
  }

  // Skip further checks if empty and not required
  if (value == null || value === '') return undefined;

  const str = String(value);

  // Min/max length
  if (rule.minLength != null && str.length < rule.minLength) {
    return rule.message ?? `En az ${rule.minLength} karakter girilmelidir`;
  }
  if (rule.maxLength != null && str.length > rule.maxLength) {
    return rule.message ?? `En fazla ${rule.maxLength} karakter girilmelidir`;
  }

  // Min/max value (numeric)
  if (rule.min != null && typeof value === 'number' && value < rule.min) {
    return rule.message ?? `Minimum değer: ${rule.min}`;
  }
  if (rule.max != null && typeof value === 'number' && value > rule.max) {
    return rule.message ?? `Maksimum değer: ${rule.max}`;
  }

  // Pattern
  if (rule.pattern) {
    try {
      const re = new RegExp(rule.pattern);
      if (!re.test(str)) {
        return rule.patternMessage ?? rule.message ?? 'Geçersiz format';
      }
    } catch {
      /* invalid regex — skip */
    }
  }

  // Cross-field expression
  if (rule.expression) {
    const result = evaluateExpression(rule.expression, allValues);
    if (result === false) {
      return rule.expressionMessage ?? rule.message ?? 'Validasyon hatası';
    }
  }

  return undefined;
}

/**
 * Validate all fields and return errors map.
 */
export function validateAllFields(
  fields: FieldConfig[],
  values: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  function walk(list: FieldConfig[]) {
    for (const f of list) {
      if (f.type === 'Row' && f.fields) {
        walk(f.fields);
        continue;
      }
      if (f.type === 'Divider') continue;

      const err = validateField(f, values[f.name], values);
      if (err) errors[f.name] = err;
    }
  }

  walk(fields);
  return errors;
}

/**
 * Run async validators (from customFunctions).
 */
export async function runAsyncValidators(
  fields: FieldConfig[],
  values: Record<string, unknown>,
  customFunctions?: CustomFunctions,
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};
  if (!customFunctions?.asyncValidators) return errors;

  const promises: Promise<void>[] = [];

  function walk(list: FieldConfig[]) {
    for (const f of list) {
      if (f.type === 'Row' && f.fields) {
        walk(f.fields);
        continue;
      }

      for (const rule of f.rules ?? []) {
        if (rule.asyncValidator && customFunctions!.asyncValidators![rule.asyncValidator]) {
          const fn = customFunctions!.asyncValidators![rule.asyncValidator];
          promises.push(
            fn(values[f.name], values).then((msg) => {
              if (msg) errors[f.name] = msg;
            }),
          );
        }
      }
    }
  }

  walk(fields);
  await Promise.all(promises);
  return errors;
}

/**
 * Collect all FieldConfig from nested structures (panels, tabs).
 */
export function collectFields(
  fields?: FieldConfig[],
  panels?: { fields: FieldConfig[] }[],
  tabs?: { fields?: FieldConfig[]; panels?: { fields: FieldConfig[] }[] }[],
): FieldConfig[] {
  const result: FieldConfig[] = [];
  if (fields) result.push(...fields);
  if (panels) {
    for (const p of panels) result.push(...p.fields);
  }
  if (tabs) {
    for (const tab of tabs) {
      if (tab.fields) result.push(...tab.fields);
      if (tab.panels) {
        for (const p of tab.panels) result.push(...p.fields);
      }
    }
  }
  return result;
}
