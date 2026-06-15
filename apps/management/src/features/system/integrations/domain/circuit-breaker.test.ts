import { describe, expect, it } from 'vitest';
import {
  createCircuitState,
  isCircuitOpen,
  recordOutcome,
  shouldTripCircuit,
} from './circuit-breaker';

const cfg = {
  enabled: true,
  errorRateThresholdPct: 50,
  windowSeconds: 60,
  minRequestCount: 4,
  openDurationSeconds: 30,
};

describe('circuit-breaker', () => {
  it('trips when failure rate exceeds threshold', () => {
    const base = Date.now();
    let state = createCircuitState();
    for (let i = 0; i < 4; i++) {
      state = recordOutcome(state, i < 2 ? 'Success' : 'Failure', base + i * 100);
    }
    expect(shouldTripCircuit(state, cfg, base + 500)).toBe(true);
    state = { ...state, openedAt: base + 500 };
    expect(isCircuitOpen(state, cfg, base + 600)).toBe(true);
  });
});
