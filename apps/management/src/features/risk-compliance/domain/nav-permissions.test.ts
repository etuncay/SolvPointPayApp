import { describe, expect, it } from 'vitest';
import {
  RISK_CHILD_IDS,
  canSeeRiskMenu,
  getVisibleRiskChildIds,
} from './nav-permissions';

describe('risk nav-permissions', () => {
  it('compliance sees all six children', () => {
    expect(getVisibleRiskChildIds('compliance')).toEqual([...RISK_CHILD_IDS]);
    expect(canSeeRiskMenu('compliance')).toBe(true);
  });

  it('management sees rk_limits and rk_admin', () => {
    expect(getVisibleRiskChildIds('management')).toEqual(['rk_limits', 'rk_admin']);
    expect(canSeeRiskMenu('management')).toBe(true);
  });

  it('ops and finance cannot see risk menu', () => {
    expect(getVisibleRiskChildIds('ops')).toEqual([]);
    expect(getVisibleRiskChildIds('finance')).toEqual([]);
    expect(canSeeRiskMenu('ops')).toBe(false);
    expect(canSeeRiskMenu('finance')).toBe(false);
  });
});
