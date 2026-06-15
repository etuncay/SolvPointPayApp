import { describe, expect, it } from 'vitest';
import { applyApprove, applyReject, canApprove } from './transitions';
import type { ApprovalRequest } from './types';
import { getCurrentUser } from './current-user';

function rec(partial: Partial<ApprovalRequest>): ApprovalRequest {
  return {
    id: 1,
    referenceNo: 'APR-TEST',
    screenName: 'Test',
    payload: { screenKey: 'test', changes: [] },
    requiredApprovals: 1,
    initiatedBy: 'u.ops',
    initiatedByName: 'Ahmet',
    initiatedAt: '2026-01-01T00:00:00Z',
    firstApprover: null,
    firstApproverName: null,
    firstApprovalAt: null,
    firstStatus: 'Pending',
    secondApprover: null,
    secondApproverName: null,
    secondApprovalAt: null,
    secondStatus: null,
    uiStatus: 'awaiting_first',
    previousApprovalRef: null,
    comment: null,
    ...partial,
  };
}

describe('transitions', () => {
  const comp = getCurrentUser('compliance');
  const mgmt = getCurrentUser('management');

  it('1-onaylı approve → Onaylandı', () => {
    const r = rec({ requiredApprovals: 1 });
    const result = applyApprove(r, comp);
    expect(result.ok).toBe(true);
    expect(result.record?.uiStatus).toBe('approved');
    expect(result.record?.firstStatus).toBe('Approved');
  });

  it('2-onaylı 1. onay → 2. Onay Bekleniyor', () => {
    const r = rec({
      requiredApprovals: 2,
      secondApprover: mgmt.id,
      secondApproverName: mgmt.displayName,
    });
    const result = applyApprove(r, comp);
    expect(result.ok).toBe(true);
    expect(result.record?.uiStatus).toBe('awaiting_second');
    expect(result.record?.secondStatus).toBe('Pending');
  });

  it('2. onaycı 1. onay tamamlanmadan onaylayamaz', () => {
    const r = rec({ requiredApprovals: 2, secondStatus: null });
    expect(canApprove(mgmt, r)).toBe(false);
    const result = applyApprove(r, mgmt);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('ap_second_before_first');
  });

  it('mükerrer onay hata döner', () => {
    const r = rec({ requiredApprovals: 1, firstStatus: 'Approved' });
    const result = applyApprove(r, comp);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('ap_duplicate_action');
  });

  it('red yorumsuz reddedilir', () => {
    const r = rec({ requiredApprovals: 1 });
    const result = applyReject(r, comp, '   ');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('ap_reject_comment_required');
  });

  it('2. kademe red → second_rejected', () => {
    const r = rec({
      requiredApprovals: 2,
      firstStatus: 'Approved',
      secondStatus: 'Pending',
    });
    const result = applyReject(r, mgmt, 'Limit aşımı');
    expect(result.ok).toBe(true);
    expect(result.record?.uiStatus).toBe('second_rejected');
  });

  it('aynı kişi hem 1. hem 2. onaycı olamaz (§0.5)', () => {
    const r = rec({
      requiredApprovals: 2,
      firstStatus: 'Approved',
      firstApprover: mgmt.id,
      firstApproverName: mgmt.displayName,
      secondStatus: 'Pending',
    });
    const result = applyApprove(r, mgmt);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('ap_same_approver');
  });
});
