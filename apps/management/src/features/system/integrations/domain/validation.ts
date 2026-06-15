import type { IntegrationDefinition } from './types';

export function validateIntegrationName(name: string): string | null {
  if (!name.trim()) return 'int_name_required';
  return null;
}

export function validateBaseUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return 'int_url_required';
  try {
    new URL(trimmed);
    return null;
  } catch {
    return 'int_url_invalid';
  }
}

export function validateCircuitBreakerFields(
  draft: Pick<
    IntegrationDefinition,
    | 'circuitBreakerEnabled'
    | 'errorRateThresholdPct'
    | 'windowSeconds'
    | 'minRequestCount'
    | 'openDurationSeconds'
  >,
): string | null {
  if (!draft.circuitBreakerEnabled) return null;
  if (draft.errorRateThresholdPct == null || draft.errorRateThresholdPct < 1) {
    return 'int_cb_threshold_invalid';
  }
  if (draft.windowSeconds == null || draft.windowSeconds < 1) return 'int_cb_window_invalid';
  if (draft.minRequestCount == null || draft.minRequestCount < 1) return 'int_cb_min_invalid';
  if (draft.openDurationSeconds == null || draft.openDurationSeconds < 1) {
    return 'int_cb_open_invalid';
  }
  return null;
}
