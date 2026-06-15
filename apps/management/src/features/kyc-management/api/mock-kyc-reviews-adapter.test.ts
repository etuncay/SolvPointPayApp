import { describe, expect, it, beforeEach } from 'vitest';
import { resetApprovalsStore } from '@/features/approval-pool/api/mock-approvals-adapter';
import {
  mockKycReviewsAdapter,
  resetKycReviewsStoreForTest,
} from './mock-kyc-reviews-adapter';

describe('mock-kyc-reviews-adapter', () => {
  beforeEach(() => {
    resetKycReviewsStoreForTest();
    resetApprovalsStore();
  });

  it('lists queue for compliance only', () => {
    const rows = mockKycReviewsAdapter.list('compliance');
    expect(rows.length).toBeGreaterThan(0);
    expect(mockKycReviewsAdapter.list('management')).toEqual([]);
  });

  it('request additional blocks entity', () => {
    const r = mockKycReviewsAdapter.requestAdditional(
      1,
      { evaluationNote: 'Ek belge gerekli' },
      'compliance',
    );
    expect(r.ok).toBe(true);
    const detail = mockKycReviewsAdapter.getById(1, 'compliance');
    expect(detail?.decision).toBe('RequestAdditional');
    expect(detail?.entityStatus).toBe('blocked');
  });

  it('verify creates approval and pending verification', () => {
    const r = mockKycReviewsAdapter.verify(
      1,
      { evaluationNote: 'Doğrulama', riskScore: 30, approverUserId: 'u.mgmt' },
      'compliance',
    );
    expect(r.ok).toBe(true);
    expect(r.approvalId).toBeGreaterThan(0);
    const detail = mockKycReviewsAdapter.getById(1, 'compliance');
    expect(detail?.decision).toBe('PendingVerification');
  });

  it('reject without note fails validation', () => {
    const r = mockKycReviewsAdapter.reject(1, { evaluationNote: '' }, 'compliance');
    expect(r.ok).toBe(false);
    expect(r.error).toBe('kyc_note_required');
  });
});
