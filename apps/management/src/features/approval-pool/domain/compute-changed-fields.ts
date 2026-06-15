import { collectFields, type FormConfig } from '@epay/ui';
import type { PayloadChange } from './types';

/** null/undefined/'' → "boş" kabul edilir (form alanlarında eşdeğer). */
function isEmpty(v: unknown): boolean {
  return v == null || v === '';
}

/** Form değer kıyaslaması — primitifler ===, koleksiyon/obje JSON ile. */
function valuesEqual(a: unknown, b: unknown): boolean {
  if (isEmpty(a) && isEmpty(b)) return true;
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a === 'object' || typeof b === 'object') {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * İki form değer objesini kıyaslar; farklı olan alan adlarını döndürür.
 * `oldValues` yoksa (yeni kayıt) tüm dolu alanlar "değişmiş" sayılır.
 */
export function computeChangedFields(
  newValues: Record<string, unknown> | undefined,
  oldValues: Record<string, unknown> | undefined,
): string[] {
  if (!newValues) return [];
  if (!oldValues) {
    return Object.keys(newValues).filter((k) => !isEmpty(newValues[k]));
  }
  const keys = new Set([...Object.keys(newValues), ...Object.keys(oldValues)]);
  const changed: string[] = [];
  for (const k of keys) {
    if (!valuesEqual(newValues[k], oldValues[k])) changed.push(k);
  }
  return changed;
}

/** Form config'inden alan adı → etiket eşlemesi (Row child'ları dahil). */
function fieldLabelMap(config: FormConfig): Map<string, string> {
  const map = new Map<string, string>();
  for (const f of collectFields(config.fields, config.panels, config.tabs)) {
    if (f.type === 'Divider' || f.type === 'Row') continue;
    map.set(f.name, f.label ?? f.name);
  }
  return map;
}

function toText(v: unknown): string {
  if (isEmpty(v)) return '—';
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

/**
 * Değişen alanlardan özet diff satırları (PayloadDiffView için) üretir.
 * Etiketler config'ten çözülür; çözülemeyen alanlar adıyla gösterilir.
 */
export function buildApprovalChanges(
  config: FormConfig,
  newValues: Record<string, unknown>,
  oldValues: Record<string, unknown> | undefined,
): PayloadChange[] {
  const labels = fieldLabelMap(config);
  const changed = computeChangedFields(newValues, oldValues);
  return changed
    .filter((name) => labels.has(name))
    .map((name) => ({
      field: name,
      label: labels.get(name) ?? name,
      oldValue: toText(oldValues?.[name]),
      newValue: toText(newValues[name]),
    }));
}
