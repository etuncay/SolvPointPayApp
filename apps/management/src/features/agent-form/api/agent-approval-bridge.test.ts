import { describe, expect, it, beforeEach } from 'vitest';
import { resetApprovalsStore } from '@/features/approval-pool/api/mock-approvals-adapter';
import { approvalsService } from '@/features/approval-pool/api';
import { createEmptyFormValues } from './mock-agent-detail-adapter';
import { createAgentApprovalRequest, parseAgentApprovalMeta } from './agent-approval-bridge';

describe('agent-approval-bridge', () => {
  beforeEach(() => {
    resetApprovalsStore();
  });

  it('createAgentApprovalRequest sets formKey and screenKey', () => {
    const values = { ...createEmptyFormValues(), name: 'Test Agent', taxNo: '1234567890' };
    const result = createAgentApprovalRequest(
      { mode: 'new', agentId: null, values },
      'ops',
    );
    expect(result.ok).toBe(true);
    const ap = approvalsService.getById(result.approvalId!);
    expect(ap?.payload.screenKey).toBe('agent_edit');
    expect(ap?.payload.formKey).toBe('agent');
    expect(parseAgentApprovalMeta(ap!)?.displayName).toBe('Test Agent');
  });
});
