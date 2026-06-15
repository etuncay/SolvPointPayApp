import { describe, expect, it, beforeEach } from 'vitest';
import {
  resetApprovalsStore,
  mockApprovalsAdapter as approvalsService,
} from '@/features/approval-pool/api/mock-approvals-adapter';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import {
  mockRiskScoresAdapter,
  __resetRiskScoresStoreForTest,
  __applyRiskScoreApprovalForTest,
} from './mock-risk-scores-adapter';

describe('mockRiskScoresAdapter', () => {
  beforeEach(() => {
    resetApprovalsStore();
    __resetRiskScoresStoreForTest();
  });

  it('getByEntityId valid — detail + history', () => {
    const d = mockRiskScoresAdapter.getByEntityId('Customer', '10042', 'compliance');
    expect(d).not.toBeNull();
    expect(d!.history.length).toBeGreaterThan(0);
    expect(d!.breakdown.length).toBeGreaterThan(0);
  });

  it('getByEntityId missing', () => {
    expect(mockRiskScoresAdapter.getByEntityId('Customer', 'NOPE', 'compliance')).toBeNull();
  });

  it('manualChange no reason', () => {
    const r = mockRiskScoresAdapter.submitManualChange(
      'Customer',
      '10042',
      { newScore: 70, reason: '' },
      'compliance',
    );
    expect(r.ok).toBe(false);
    expect(r.error).toBe('rsc_reason_required');
  });

  it('manualChange score 101', () => {
    const r = mockRiskScoresAdapter.submitManualChange(
      'Customer',
      '10042',
      { newScore: 101, reason: 'x' },
      'compliance',
    );
    expect(r.ok).toBe(false);
    expect(r.error).toBe('rsc_score_range');
  });

  it('manualChange ok — approval created, score unchanged', () => {
    const before = mockRiskScoresAdapter.getByEntityId('Customer', '10042', 'compliance')!;
    const r = mockRiskScoresAdapter.submitManualChange(
      'Customer',
      '10042',
      { newScore: 72, reason: 'İnceleme' },
      'compliance',
    );
    expect(r.ok).toBe(true);
    const after = mockRiskScoresAdapter.getByEntityId('Customer', '10042', 'compliance')!;
    expect(after.score).toBe(before.score);
    expect(after.pendingApprovalId).toBe(r.approvalId);
  });

  it('onay sonrası skor güncellenir', () => {
    const r = mockRiskScoresAdapter.submitManualChange(
      'Agent',
      'AG-001',
      { newScore: 55, reason: 'Güncelleme' },
      'compliance',
    );
    const user = getCurrentUser('compliance');
    approvalsService.approve(r.approvalId!, user);
    __applyRiskScoreApprovalForTest(r.approvalId!);
    const after = mockRiskScoresAdapter.getByEntityId('Agent', 'AG-001', 'compliance')!;
    expect(after.score).toBe(55);
    expect(after.history[0]?.changeType).toBe('manual');
  });
});
