import { describe, expect, it, beforeEach } from 'vitest';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { resetSupportCasesStore } from '@/mocks/support-cases-store';
import { DEFAULT_SUPPORT_CASE_FILTERS, EMPTY_SUPPORT_CASE_FORM } from '../domain/types';
import { mockSupportCasesAdapter, supportCasesService } from './mock-support-cases-adapter';

describe('mock-support-cases-adapter', () => {
  beforeEach(() => {
    resetSupportCasesStore();
    mockSupportCasesAdapter.resetListAccessLogForTests();
  });

  it('ops lists all seed cases', () => {
    const user = getCurrentUser('ops');
    const rows = supportCasesService.list('ops', user.id, DEFAULT_SUPPORT_CASE_FILTERS);
    expect(rows.length).toBeGreaterThanOrEqual(7);
  });

  it('assignedToMe filters by owner', () => {
    const user = getCurrentUser('ops');
    const all = supportCasesService.list('ops', user.id, DEFAULT_SUPPORT_CASE_FILTERS);
    const mine = supportCasesService.list('ops', user.id, {
      ...DEFAULT_SUPPORT_CASE_FILTERS,
      assignedToMe: true,
    });
    expect(mine.length).toBeLessThan(all.length);
    expect(mine.every((r) => r.ownerDisplayName === user.displayName)).toBe(true);
  });

  it('includes reconciliation discrepancy seed', () => {
    const user = getCurrentUser('management');
    const rows = supportCasesService.list('management', user.id, {
      ...DEFAULT_SUPPORT_CASE_FILTERS,
      complaintType: 'ReconciliationDiscrepancy',
    });
    expect(rows.some((r) => r.caseNo === 'SC-2026-00006')).toBe(true);
  });

  it('logs list access', () => {
    const user = getCurrentUser('ops');
    supportCasesService.list('ops', user.id, DEFAULT_SUPPORT_CASE_FILTERS);
    expect(mockSupportCasesAdapter.getListAccessLog().length).toBe(1);
  });

  it('creates Assigned when owner set', () => {
    const user = getCurrentUser('ops');
    const result = supportCasesService.create(user.role, user.id, user.displayName, {
      ...EMPTY_SUPPORT_CASE_FORM,
      requesterType: 'Customer',
      requesterId: '10042',
      subject: 'Test',
      complaintType: 'General',
      ownerUserId: user.id,
      detail: 'detay',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const d = supportCasesService.getDetail('ops', user.id, result.id);
      expect(d?.caseStatus).toBe('Assigned');
    }
  });

  it('postAction resolve sets closed', () => {
    const user = getCurrentUser('ops');
    const created = supportCasesService.create(user.role, user.id, user.displayName, {
      ...EMPTY_SUPPORT_CASE_FORM,
      requesterType: 'Customer',
      requesterId: '1',
      subject: 'Kapat',
      complaintType: 'General',
      ownerUserId: user.id,
      detail: '',
    });
    if (!created.ok) return;
    const action = supportCasesService.postAction(user.role, user.id, user.displayName, created.id, {
      kind: 'resolve',
      note: 'Çözüldü',
      resolutionCode: 'Resolved_IssueFixed',
    });
    expect(action.ok).toBe(true);
    const d = supportCasesService.getDetail('ops', user.id, created.id);
    expect(d?.caseStatus).toBe('Resolved_IssueFixed');
    expect(d?.closedAt).not.toBeNull();
  });
});
