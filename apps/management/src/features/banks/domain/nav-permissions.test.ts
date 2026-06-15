import { describe, expect, it } from 'vitest';
import {
  BANKS_CHILD_IDS,
  canSeeBanksMenu,
  getDefaultBanksHref,
  getVisibleBanksChildIds,
} from './nav-permissions';

describe('banks nav-permissions', () => {
  it('finance sees all four children in order', () => {
    expect(getVisibleBanksChildIds('finance')).toEqual([...BANKS_CHILD_IDS]);
  });

  it('management sees all four children', () => {
    expect(getVisibleBanksChildIds('management')).toEqual([...BANKS_CHILD_IDS]);
  });

  it('ops sees only movements and reconciliation', () => {
    expect(getVisibleBanksChildIds('ops')).toEqual(['bk_movements', 'bk_recon']);
  });

  it('compliance cannot see banks menu', () => {
    expect(getVisibleBanksChildIds('compliance')).toEqual([]);
    expect(canSeeBanksMenu('compliance')).toBe(false);
  });

  it('default href is first visible child', () => {
    expect(getDefaultBanksHref('finance')).toBe('/banks/integrated');
    expect(getDefaultBanksHref('ops')).toBe('/banks/movements');
    expect(getDefaultBanksHref('compliance')).toBeNull();
  });
});
