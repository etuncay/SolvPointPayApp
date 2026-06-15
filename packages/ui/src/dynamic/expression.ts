/* ──────────────────────────────────────────────────────
 *  Expression evaluator — safe subset of JS expressions
 *  Evaluates string expressions against form values.
 *  Uses Function constructor with a restricted scope.
 *
 *  NOTE: config ifadeleri güvenilir kaynaktan (bundle'lı JSON)
 *  gelmelidir. İfadeler runtime'da API'den geliyorsa bu motor
 *  yerine allow-list tabanlı bir değerlendirici kullanılmalıdır.
 * ────────────────────────────────────────────────────── */
import type { FormMode } from './form-mode';

const CACHE = new Map<string, ((values: Record<string, unknown>, mode?: FormMode) => unknown) | null>();
/** Aynı ifade için tekrar tekrar uyarı basmamak adına. */
const WARNED = new Set<string>();

function isDev(): boolean {
  // Vite/modern bundler: import.meta.env.DEV — yoksa sessiz.
  try {
    return Boolean((import.meta as unknown as { env?: { DEV?: boolean } })?.env?.DEV);
  } catch {
    return false;
  }
}

function warnOnce(expr: string, detail: string): void {
  if (WARNED.has(expr)) return;
  WARNED.add(expr);
  if (isDev()) console.warn(`[DynamicForm] ${detail}: ${expr}`);
}

/**
 * Evaluate a string expression against form values + mode.
 * Returns the result (typically boolean).
 *
 * `onError` — değerlendirme/parse hatasında dönecek değer.
 * Görünürlük gibi güvenlik-hassas kullanımda `false` verilmeli
 * (fail-closed). Varsayılan `true` geriye dönük uyumluluk içindir.
 *
 * Example: `'values.country === "TR"'` → true/false
 */
export function evaluateExpression(
  expr: string,
  values: Record<string, unknown>,
  mode?: FormMode,
  onError: unknown = true,
): unknown {
  if (!expr) return true;

  let fn = CACHE.get(expr);
  if (fn === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      fn = new Function('values', 'mode', `"use strict"; return (${expr});`) as (
        values: Record<string, unknown>,
        mode?: FormMode,
      ) => unknown;
      CACHE.set(expr, fn);
    } catch {
      CACHE.set(expr, null); // parse hatası — tekrar denenmesin
      warnOnce(expr, 'Geçersiz ifade (parse)');
      return onError;
    }
  }
  if (fn === null) return onError;

  try {
    return fn(values, mode);
  } catch {
    warnOnce(expr, 'İfade çalışma-zamanı hatası');
    return onError;
  }
}

/**
 * Evaluate a boolean expression.
 * `fallback` — ifade tanımlı ama değerlendirilemezse dönecek boolean.
 * Görünürlük için `false` (fail-closed) geçilmelidir.
 */
export function evalBool(
  expr: string | undefined,
  values: Record<string, unknown>,
  mode?: FormMode,
  fallback = true,
): boolean {
  if (!expr) return true;
  return Boolean(evaluateExpression(expr, values, mode, fallback));
}
