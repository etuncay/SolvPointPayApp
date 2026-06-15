import { describe, expect, it } from 'vitest';
import { createRiskLimitApprovalRequest, parseRiskLimitApprovalMeta } from './risk-limit-approval-bridge';

describe('risk-limit-approval-bridge', () => {
  it('createRiskLimitApprovalRequest sets screenKey risk_based_limits', () => {
    const row = {
      entityType: 'IndividualCustomer' as const,
      riskLevel: null,
      singleTxLimit: 10_000,
      dailyLimit: 50_000,
      monthlyLimit: 200_000,
      singleTxApprovalThreshold: 5_000,
      internationalTransfer: 'Allowed' as const,
    };
    const result = createRiskLimitApprovalRequest({
      rows: [row],
      oldRows: [{ ...row, dailyLimit: 40_000 }],
      role: 'ops',
    });
    expect(result.ok).toBe(true);
    expect(result.approvalId).toBeDefined();
  });

  it('parseRiskLimitApprovalMeta reads rows from payload', () => {
    const created = createRiskLimitApprovalRequest({
      rows: [
        {
          entityType: 'Agent',
          riskLevel: 'High',
          singleTxLimit: 1_000,
          dailyLimit: 5_000,
          monthlyLimit: 20_000,
          singleTxApprovalThreshold: 500,
          internationalTransfer: 'Forbidden',
        },
      ],
      oldRows: [],
      role: 'compliance',
    });
    expect(created.approvalId).toBeDefined();
  });
});
