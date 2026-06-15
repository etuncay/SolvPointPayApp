import { describe, expect, it } from 'vitest';
import { getCaseDetailPermissions } from './detail-permissions';

describe('getCaseDetailPermissions', () => {
  it('operator — approve, reject, route, exception; no report', () => {
    const p = getCaseDetailPermissions('operator', {
      isClosed: false,
      assignedToManager: false,
    });
    expect(p.canApprove).toBe(true);
    expect(p.canReject).toBe(true);
    expect(p.canRoute).toBe(true);
    expect(p.canException).toBe(true);
    expect(p.canReport).toBe(false);
  });

  it('manager — approve, reject, report; no route', () => {
    const p = getCaseDetailPermissions('manager', {
      isClosed: false,
      assignedToManager: false,
    });
    expect(p.canReport).toBe(true);
    expect(p.canRoute).toBe(false);
    expect(p.canException).toBe(false);
  });

  it('closed case — actions disabled', () => {
    const p = getCaseDetailPermissions('operator', {
      isClosed: true,
      assignedToManager: false,
    });
    expect(p.actionsEnabled).toBe(false);
    expect(p.actions).toEqual([]);
  });
});
