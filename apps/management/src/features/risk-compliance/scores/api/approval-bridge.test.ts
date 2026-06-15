import { describe, expect, it, beforeEach } from 'vitest';
import { resetApprovalsStore } from '@/features/approval-pool/api/mock-approvals-adapter';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { createRiskScoreApprovalRequest, parseRiskScoreApprovalMeta } from './approval-bridge';
import { approvalsService } from '@/features/approval-pool/api';

describe('approval-bridge', () => {
  beforeEach(() => {
    resetApprovalsStore();
  });

  it('createRiskScoreApprovalRequest screenKey risk_manual_score', () => {
    const result = createRiskScoreApprovalRequest(
      {
        source: 'Customer',
        entityId: '10042',
        entityKey: 'Customer:10042',
        displayName: 'Demo',
        oldScore: 68,
        newScore: 75,
        reason: 'Test',
      },
      'compliance',
    );
    expect(result.ok).toBe(true);
    const ap = approvalsService.getById(result.approvalId!);
    expect(ap?.payload.screenKey).toBe('risk_manual_score');
    const meta = parseRiskScoreApprovalMeta(ap!);
    expect(meta?.newScore).toBe(75);
  });

  it('parse null for other screenKey', () => {
    const ap = approvalsService.getById(1);
    expect(ap).not.toBeNull();
    expect(parseRiskScoreApprovalMeta(ap!)).toBeNull();
  });
});
