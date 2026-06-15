import { describe, expect, it, beforeEach } from 'vitest';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import { resetSystemParametersStore } from '@/mocks/system-parameters';
import { createParameterApprovalRequest } from './parameter-approval-bridge';
import { resetParametersAuditLog, parametersService } from './mock-parameters-adapter';

describe('parametersService', () => {
  beforeEach(() => {
    resetSystemParametersStore();
    resetParametersAuditLog();
  });

  it('rejects invalid value', () => {
    const rows = parametersService.list('management', { query: '', group: 'any', status: 'any' });
    const target = rows.find((r) => r.parameterKey === 'reconciliation.amount_tolerance_try')!;
    const result = parametersService.update('management', MOCK_USER_IDS.management, target.id, {
      value: 'not-a-number',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errorCode).toBe('prm_invalid_value');
  });

  it('writes audit on valid update', () => {
    const rows = parametersService.list('management', { query: '', group: 'any', status: 'any' });
    const target = rows.find((r) => r.parameterKey === 'reconciliation.amount_tolerance_try')!;
    const result = parametersService.update('management', MOCK_USER_IDS.management, target.id, {
      value: '0.02',
    });
    expect(result.ok).toBe(true);
    const audit = parametersService.getAuditLog(target.parameterKey);
    expect(audit.some((e) => e.field === 'value' && e.oldValue === '0.01')).toBe(true);
  });

  it('critical fraud timeout creates approval request', () => {
    const rows = parametersService.list('management', { query: '', group: 'any', status: 'any' });
    const target = rows.find((r) => r.parameterKey === 'fraud.engine_timeout_ms')!;
    const created = createParameterApprovalRequest({
      parameterId: target.id,
      parameterKey: target.parameterKey,
      before: { value: target.value, status: target.status },
      payload: { value: '200' },
      role: 'management',
      userId: MOCK_USER_IDS.management,
      skipCriticalConfirm: true,
    });
    expect(created.ok).toBe(true);
  });
});
