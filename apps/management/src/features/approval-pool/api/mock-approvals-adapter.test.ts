import { describe, expect, it, beforeEach } from 'vitest';
import { getCurrentUser, resolveCurrentUser } from '../domain/current-user';
import {
  mockApprovalsAdapter,
  resetApprovalsStore,
} from './mock-approvals-adapter';

describe('mockApprovalsAdapter', () => {
  beforeEach(() => {
    resetApprovalsStore();
  });

  it('1-onaylı approve → Onaylandı', () => {
    const user = getCurrentUser('compliance');
    const result = mockApprovalsAdapter.approve(1, user);
    expect(result.ok).toBe(true);
    const row = mockApprovalsAdapter.getById(1);
    expect(row?.uiStatus).toBe('approved');
  });

  it('2-onaylı 1. onay sonrası awaiting_second', () => {
    const comp = getCurrentUser('compliance');
    const result = mockApprovalsAdapter.approve(2, comp);
    expect(result.ok).toBe(true);
    expect(mockApprovalsAdapter.getById(2)?.uiStatus).toBe('awaiting_second');
  });

  it('management 1. onay bekleyen kaydı pending_mine görmez', () => {
    const mgmt = getCurrentUser('management');
    const pending = mockApprovalsAdapter.list('pending_mine', mgmt);
    expect(pending.some((r) => r.id === 2)).toBe(false);
    expect(pending.some((r) => r.id === 3)).toBe(true);
  });

  it('2. onaycı 1. pending iken approve hata', () => {
    const mgmt = getCurrentUser('management');
    const result = mockApprovalsAdapter.approve(2, mgmt);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('ap_second_before_first');
  });

  it('mükerrer approve status değiştirmez', () => {
    const comp = getCurrentUser('compliance');
    mockApprovalsAdapter.approve(1, comp);
    const before = mockApprovalsAdapter.getById(1);
    const again = mockApprovalsAdapter.approve(1, comp);
    expect(again.ok).toBe(false);
    expect(mockApprovalsAdapter.getById(1)?.uiStatus).toBe(before?.uiStatus);
  });

  it('withdraw yalnızca başlatanda', () => {
    const ops = resolveCurrentUser(
      { id: 'usr-ops', fullName: 'Ahmet Yılmaz', role: 'ops' },
      'ops',
    );
    const comp = getCurrentUser('compliance');
    expect(mockApprovalsAdapter.withdraw(1, comp).ok).toBe(false);
    const ok = mockApprovalsAdapter.withdraw(1, ops);
    expect(ok.ok).toBe(true);
    expect(mockApprovalsAdapter.getById(1)?.uiStatus).toBe('withdrawn');
  });

  it('resubmit eski kaydı Superseded yapar', () => {
    const ops = resolveCurrentUser(
      { id: 'usr-ops', fullName: 'Ahmet Yılmaz', role: 'ops' },
      'ops',
    );
    mockApprovalsAdapter.withdraw(1, ops);
    const res = mockApprovalsAdapter.resubmit(1, ops);
    expect(res.ok).toBe(true);
    expect(mockApprovalsAdapter.getById(1)?.uiStatus).toBe('superseded');
    const newRow = mockApprovalsAdapter.getById(res.id!);
    expect(newRow?.previousApprovalRef).toBe(1);
    expect(newRow?.uiStatus).toBe('awaiting_first');
  });

  it('reddedilen talep resubmit edilebilir → eski Superseded (§0.6)', () => {
    const ops = resolveCurrentUser(
      { id: 'usr-ops', fullName: 'Ahmet Yılmaz', role: 'ops' },
      'ops',
    );
    const comp = getCurrentUser('compliance');
    mockApprovalsAdapter.reject(1, comp, 'Eksik belge');
    expect(mockApprovalsAdapter.getById(1)?.uiStatus).toBe('rejected');
    const res = mockApprovalsAdapter.resubmit(1, ops);
    expect(res.ok).toBe(true);
    expect(mockApprovalsAdapter.getById(1)?.uiStatus).toBe('superseded');
    const newRow = mockApprovalsAdapter.getById(res.id!);
    expect(newRow?.previousApprovalRef).toBe(1);
    expect(newRow?.uiStatus).toBe('awaiting_first');
  });

  it('block sonrası liste status güncellenir', () => {
    const comp = getCurrentUser('compliance');
    mockApprovalsAdapter.approve(1, comp);
    const list = mockApprovalsAdapter.list('approved_mine', comp);
    expect(list.some((r) => r.id === 1)).toBe(true);
  });

  it('alltest rolü pending_mine — 1. ve 2. kademe bekleyenler', () => {
    const user = getCurrentUser('alltest');
    expect(user.canFirstApprove).toBe(true);
    expect(user.canSecondApprove).toBe(true);
    const pending = mockApprovalsAdapter.list('pending_mine', user);
    expect(pending.some((r) => r.id === 1)).toBe(true);
    expect(pending.some((r) => r.id === 3)).toBe(true);
  });
});
