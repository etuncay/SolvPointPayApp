import { describe, expect, it } from 'vitest';
import { OPS_CHILD_IDS, canSeeOpsMenu, getVisibleOpsChildIds } from './nav-permissions';

describe('ops nav-permissions', () => {
  it('ops sees only op_approval', () => {
    expect(getVisibleOpsChildIds('ops')).toEqual(['op_approval']);
  });

  it('compliance sees only op_kyc', () => {
    expect(getVisibleOpsChildIds('compliance')).toEqual(['op_kyc']);
  });

  it('finance sees 8.3–8.6 in order', () => {
    expect(getVisibleOpsChildIds('finance')).toEqual([
      'op_accounting',
      'op_btrans',
      'op_recon',
      'op_fx',
    ]);
  });

  it('management sees same finance children', () => {
    expect(getVisibleOpsChildIds('management')).toEqual(getVisibleOpsChildIds('finance'));
  });

  it('canSeeOpsMenu by role', () => {
    expect(canSeeOpsMenu('ops')).toBe(true);
    expect(canSeeOpsMenu('compliance')).toBe(true);
    expect(canSeeOpsMenu('finance')).toBe(true);
    expect(canSeeOpsMenu('management')).toBe(true);
  });

  it('filter preserves spec order among visible ids', () => {
    const finance = getVisibleOpsChildIds('finance');
    const indices = finance.map((id) => OPS_CHILD_IDS.indexOf(id));
    expect(indices).toEqual([...indices].sort((a, b) => a - b));
  });
});
