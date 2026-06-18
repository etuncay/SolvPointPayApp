import { describe, expect, it, beforeEach } from 'vitest';
import { getCurrentUser } from '../domain/current-user';
import {
  assertDerivedUiStatuses,
  assertGetByIdMatchesStore,
  assertPendingCountMatchesList,
  assertWidgetMatchesPending,
} from './approval-store-invariants';
import {
  getApprovalsStoreSnapshot,
  mockApprovalsAdapter,
  pendingApprovalWidgetRows,
  resetApprovalsStore,
} from './mock-approvals-adapter';

describe('approval store + filter regression (approve/reject)', () => {
  beforeEach(() => {
    resetApprovalsStore();
  });

  function assertStoreHealthy(user: ReturnType<typeof getCurrentUser>) {
    assertDerivedUiStatuses();
    assertPendingCountMatchesList(user);
    assertWidgetMatchesPending(user);
  }

  it('1-onaylı approve: pending düşer, approved_mine artar, store tutarlı', () => {
    const comp = getCurrentUser('compliance');
    const pendingBefore = mockApprovalsAdapter.list('pending_mine', comp).map((r) => r.id);
    expect(pendingBefore).toContain(1);

    const result = mockApprovalsAdapter.approve(1, comp, 'Uygun');
    expect(result.ok).toBe(true);

    const row = mockApprovalsAdapter.getById(1);
    expect(row?.uiStatus).toBe('approved');
    expect(row?.firstApprover).toBe(comp.id);
    expect(row?.comment).toBe('Uygun');

    expect(mockApprovalsAdapter.list('pending_mine', comp).some((r) => r.id === 1)).toBe(false);
    expect(mockApprovalsAdapter.list('approved_mine', comp).some((r) => r.id === 1)).toBe(true);

    assertGetByIdMatchesStore(1);
    assertStoreHealthy(comp);
  });

  it('1-onaylı reject: pending düşer, rejected_mine artar', () => {
    const comp = getCurrentUser('compliance');
    const pendingBefore = mockApprovalsAdapter.countPendingForUser(comp);

    mockApprovalsAdapter.reject(1, comp, 'Eksik belge');

    expect(mockApprovalsAdapter.getById(1)?.uiStatus).toBe('rejected');
    expect(mockApprovalsAdapter.countPendingForUser(comp)).toBe(pendingBefore - 1);
    expect(mockApprovalsAdapter.list('rejected_mine', comp).some((r) => r.id === 1)).toBe(true);
    expect(mockApprovalsAdapter.list('pending_mine', comp).some((r) => r.id === 1)).toBe(false);

    assertStoreHealthy(comp);
  });

  it('2-onaylı 1. approve: awaiting_second; 1. onaycı pending dışı, 2. onaycı pending içi', () => {
    const comp = getCurrentUser('compliance');
    const mgmt = getCurrentUser('management');

    mockApprovalsAdapter.approve(2, comp);

    expect(mockApprovalsAdapter.getById(2)?.uiStatus).toBe('awaiting_second');
    expect(mockApprovalsAdapter.list('pending_mine', comp).some((r) => r.id === 2)).toBe(false);
    expect(mockApprovalsAdapter.list('approved_mine', comp).some((r) => r.id === 2)).toBe(true);
    expect(mockApprovalsAdapter.list('pending_mine', mgmt).some((r) => r.id === 2)).toBe(true);

    assertStoreHealthy(comp);
    assertStoreHealthy(mgmt);
  });

  it('2-onaylı 2. approve: tam onay; her iki onaycı pending dışı', () => {
    const comp = getCurrentUser('compliance');
    const mgmt = getCurrentUser('management');

    mockApprovalsAdapter.approve(3, mgmt);

    expect(mockApprovalsAdapter.getById(3)?.uiStatus).toBe('approved');
    expect(mockApprovalsAdapter.list('pending_mine', mgmt).some((r) => r.id === 3)).toBe(false);
    expect(mockApprovalsAdapter.list('approved_mine', comp).some((r) => r.id === 3)).toBe(true);
    expect(mockApprovalsAdapter.list('approved_mine', mgmt).some((r) => r.id === 3)).toBe(true);

    assertStoreHealthy(mgmt);
  });

  it('2. kademe reject: second_rejected; yalnızca 2. onaycı rejected_mine görür', () => {
    const comp = getCurrentUser('compliance');
    const mgmt = getCurrentUser('management');

    mockApprovalsAdapter.reject(3, mgmt, 'Limit aşımı');

    expect(mockApprovalsAdapter.getById(3)?.uiStatus).toBe('second_rejected');
    expect(mockApprovalsAdapter.list('rejected_mine', mgmt).some((r) => r.id === 3)).toBe(true);
    expect(mockApprovalsAdapter.list('rejected_mine', comp).some((r) => r.id === 3)).toBe(false);
    expect(mockApprovalsAdapter.list('pending_mine', mgmt).some((r) => r.id === 3)).toBe(false);

    assertStoreHealthy(mgmt);
  });

  it('alltest approve sonrası widget ve pending senkron', () => {
    const user = getCurrentUser('alltest');
    const widgetBefore = pendingApprovalWidgetRows(user).length;
    const pendingBefore = mockApprovalsAdapter.countPendingForUser(user);
    expect(widgetBefore).toBe(Math.min(8, pendingBefore));

    mockApprovalsAdapter.approve(1, user);

    const pendingAfter = mockApprovalsAdapter.countPendingForUser(user);
    expect(pendingAfter).toBe(pendingBefore - 1);
    expect(pendingApprovalWidgetRows(user).length).toBe(Math.min(8, pendingAfter));
    assertWidgetMatchesPending(user);
  });

  it('store snapshot mutasyonu canlı storeu bozmaz', () => {
    const snap = getApprovalsStoreSnapshot();
    snap[0]!.uiStatus = 'approved';
    expect(mockApprovalsAdapter.getById(snap[0]!.id)?.uiStatus).not.toBe('approved');
  });

  it('mükerrer approve storeu değiştirmez', () => {
    const comp = getCurrentUser('compliance');
    mockApprovalsAdapter.approve(1, comp);
    const afterFirst = JSON.stringify(mockApprovalsAdapter.getById(1));

    mockApprovalsAdapter.approve(1, comp);
    expect(JSON.stringify(mockApprovalsAdapter.getById(1))).toBe(afterFirst);
    assertDerivedUiStatuses();
  });
});
