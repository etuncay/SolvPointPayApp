import { describe, expect, it, beforeEach } from 'vitest';
import { resetFieldApprovalRulesStore } from '@/mocks/field-approval-rules';
import { resetScreenApprovalRulesStore } from '@/mocks/screen-approval-rules';
import {
  isScreenWriteBlocked,
  rebuildBlockedScreenWrites,
} from '../domain/screen-mutation-guard';
import { approvalRulesService } from './mock-approval-rules-adapter';

describe('approvalRulesService', () => {
  beforeEach(() => {
    resetScreenApprovalRulesStore();
    resetFieldApprovalRulesStore();
    rebuildBlockedScreenWrites();
  });

  it('allows screen save when approvalCount=2 with second approver pool', () => {
    const screens = approvalRulesService.listScreens('management');
    const target = screens.find((s) => s.approvalCount !== 2)!;
    const result = approvalRulesService.saveScreens('management', [
      { id: target.id, approvalCount: 2 },
    ]);
    expect(result.ok).toBe(true);
  });

  it('allows screen save with approvalCount=0 and unblocks', () => {
    const screens = approvalRulesService.listScreens('management');
    const target = screens.find((s) => s.screenKey === 'risk.admin')!;
    const result = approvalRulesService.saveScreens('management', [
      { id: target.id, approvalCount: 0 },
    ]);
    expect(result.ok).toBe(true);
    rebuildBlockedScreenWrites();
    expect(isScreenWriteBlocked('risk.admin')).toBe(false);
  });

  it('persists field rule when approver pool staffed (12.3)', () => {
    const result = approvalRulesService.createField('management', {
      operationName: 'test.warn.rule',
      screenId: 'agents.list',
      fieldName: 'amount',
      specialCondition: null,
      scope: 'FieldChanges',
      approvalCount: 2,
      noApprovalLimit: null,
      oneApprovalLimit: null,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.warnings.length).toBe(0);
  });
});
