import { describe, expect, it } from 'vitest';
import {
  createParameterApprovalRequest,
  createParameterFormApprovalRequest,
  parseParameterApprovalMeta,
} from './parameter-approval-bridge';
import { approvalsService } from '@/features/approval-pool/api';

describe('parameter-approval-bridge', () => {
  it('createParameterApprovalRequest sets screenKey system_parameters', () => {
    const result = createParameterApprovalRequest({
      parameterId: 'prm-fraud-timeout',
      parameterKey: 'fraud.engine_timeout_ms',
      before: { value: '-1', status: 'Active' },
      payload: { value: '0' },
      role: 'management',
      userId: 'usr-mgmt',
      skipCriticalConfirm: true,
    });
    expect(result.ok).toBe(true);
    expect(result.approvalId).toBeDefined();
  });

  it('createParameterFormApprovalRequest sets formKey system_parameter', () => {
    const result = createParameterFormApprovalRequest({
      mode: 'new',
      parameterId: null,
      values: {
        parameterKey: 'approval.pool_refresh_interval_seconds',
        groupName: 'approval',
        valueType: 'number',
        description: 'prm_desc_pool_refresh_interval_seconds',
        value: '30',
        status: 'Active',
      },
      role: 'management',
      userId: 'usr-mgmt',
    });
    expect(result.ok).toBe(true);
    const approval = approvalsService.getById(result.approvalId!);
    expect(approval?.payload.formKey).toBe('system_parameter');
    expect(approval?.payload.screenKey).toBe('system_parameters');
  });

  it('parseParameterApprovalMeta reads form payload', () => {
    const created = createParameterFormApprovalRequest({
      mode: 'edit',
      parameterId: 'prm-treasury',
      values: {
        parameterKey: 'treasury.reserve_max_amount_try',
        groupName: 'treasury',
        valueType: 'number',
        description: 'prm_desc_reserve_max_amount_try',
        value: '6000000',
        status: 'Active',
      },
      oldValues: {
        parameterKey: 'treasury.reserve_max_amount_try',
        groupName: 'treasury',
        valueType: 'number',
        description: 'prm_desc_reserve_max_amount_try',
        value: '5000000',
        status: 'Active',
      },
      role: 'management',
      userId: 'usr-mgmt',
    });
    expect(created.approvalId).toBeDefined();
    const approval = approvalsService.getById(created.approvalId!);
    const meta = parseParameterApprovalMeta(approval!);
    expect(meta?.mode).toBe('edit');
    expect(meta?.input.value).toBe('6000000');
  });
});
