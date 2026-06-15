import { getCatalogEntry } from './parameter-catalog';
import type { ParameterValueType } from './types';

export function validateParameterValue(
  parameterKey: string,
  rawValue: string,
): string | null {
  const entry = getCatalogEntry(parameterKey);
  if (!entry) return 'prm_unknown_key';

  const value = rawValue.trim();
  if (!value) return 'prm_invalid_value';

  switch (entry.valueType) {
    case 'boolean': {
      if (value !== 'true' && value !== 'false') return 'prm_invalid_value';
      return null;
    }
    case 'string': {
      if (entry.maxLength != null && value.length > entry.maxLength) return 'prm_invalid_value';
      return null;
    }
    case 'number': {
      const n = Number(value);
      if (!Number.isFinite(n)) return 'prm_invalid_value';
      if (entry.min != null && n < entry.min) return 'prm_invalid_value';
      if (entry.max != null && n > entry.max) return 'prm_invalid_value';
      return null;
    }
    case 'duration_ms': {
      if (value === '-1') return null;
      const n = Number(value);
      if (!Number.isInteger(n) || n < 0) return 'prm_invalid_value';
      return null;
    }
    default:
      return 'prm_invalid_value';
  }
}

export function parseParameterValue<T>(
  valueType: ParameterValueType,
  raw: string,
  fallback: T,
): T {
  switch (valueType) {
    case 'boolean':
      return (raw === 'true') as T;
    case 'number':
    case 'duration_ms': {
      const n = Number(raw);
      return (Number.isFinite(n) ? n : fallback) as T;
    }
    case 'string':
      return raw as T;
    default:
      return fallback;
  }
}

export function needsCriticalZeroConfirm(parameterKey: string, rawValue: string): boolean {
  const entry = getCatalogEntry(parameterKey);
  return Boolean(entry?.criticalZeroConfirm && rawValue.trim() === '0');
}
