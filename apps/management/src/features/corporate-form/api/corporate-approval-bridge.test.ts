import { describe, expect, it, beforeEach } from 'vitest';
import { resetApprovalsStore } from '@/features/approval-pool/api/mock-approvals-adapter';
import { approvalsService } from '@/features/approval-pool/api';
import { createEmptyFormValues } from './mock-corporate-adapter';
import {
  createCorporateApprovalRequest,
  parseCorporateApprovalMeta,
} from './corporate-approval-bridge';

describe('corporate-approval-bridge', () => {
  beforeEach(() => {
    resetApprovalsStore();
  });

  it('createCorporateApprovalRequest sets formKey and screenKey', () => {
    const values = { ...createEmptyFormValues(), tradeName: 'Test A.Ş.', taxNo: '1234567890' };
    const result = createCorporateApprovalRequest(
      { mode: 'new', customerId: null, values },
      'ops',
    );
    expect(result.ok).toBe(true);
    const ap = approvalsService.getById(result.approvalId!);
    expect(ap?.payload.screenKey).toBe('customer_corporate');
    expect(ap?.payload.formKey).toBe('corporate');
    const meta = parseCorporateApprovalMeta(ap!);
    expect(meta?.displayName).toBe('Test A.Ş.');
    expect(meta?.fullValues.tradeName).toBe('Test A.Ş.');
  });

  it('parseCorporateApprovalMeta returns null for other screenKey', () => {
    const ap = approvalsService.getById(1);
    expect(ap).not.toBeNull();
    if (ap!.payload.screenKey === 'customer_corporate') return;
    expect(parseCorporateApprovalMeta(ap!)).toBeNull();
  });
});
