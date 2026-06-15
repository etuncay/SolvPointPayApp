import type { RequestOutcome } from './types';

export type CircuitSample = { at: number; outcome: RequestOutcome };

export type CircuitBreakerConfig = {
  enabled: boolean;
  errorRateThresholdPct: number;
  windowSeconds: number;
  minRequestCount: number;
  openDurationSeconds: number;
};

export type CircuitBreakerState = {
  openedAt: number | null;
  samples: CircuitSample[];
};

export function createCircuitState(): CircuitBreakerState {
  return { openedAt: null, samples: [] };
}

export function recordOutcome(
  state: CircuitBreakerState,
  outcome: RequestOutcome,
  now = Date.now(),
): CircuitBreakerState {
  return {
    ...state,
    samples: [...state.samples, { at: now, outcome }],
  };
}

export function isCircuitOpen(
  state: CircuitBreakerState,
  config: CircuitBreakerConfig,
  now = Date.now(),
): boolean {
  if (!config.enabled) return false;
  if (state.openedAt != null) {
    const until = state.openedAt + config.openDurationSeconds * 1000;
    if (now < until) return true;
  }
  const cutoff = now - config.windowSeconds * 1000;
  const window = state.samples.filter((s) => s.at >= cutoff);
  if (window.length < config.minRequestCount) return false;
  const failures = window.filter((s) => s.outcome === 'Failure').length;
  const rate = (failures / window.length) * 100;
  if (rate >= config.errorRateThresholdPct) {
    return true;
  }
  return false;
}

export function shouldTripCircuit(
  state: CircuitBreakerState,
  config: CircuitBreakerConfig,
  now = Date.now(),
): boolean {
  if (!config.enabled) return false;
  const cutoff = now - config.windowSeconds * 1000;
  const window = state.samples.filter((s) => s.at >= cutoff);
  if (window.length < config.minRequestCount) return false;
  const failures = window.filter((s) => s.outcome === 'Failure').length;
  return (failures / window.length) * 100 >= config.errorRateThresholdPct;
}
