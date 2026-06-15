import {
  getFieldApprovalRulesStore,
  getFieldRuleByOperation,
} from '@/mocks/field-approval-rules';
import { getScreenRuleByKey } from '@/mocks/screen-approval-rules';
import { getScreenByKey } from '@/features/system/shared/screen-registry';
import { tierApprovalCount } from './high-amount-tier';
import { isScreenWriteBlocked } from './screen-mutation-guard';
import type { ApprovalCount } from './types';

export function getScreenApprovalCount(screenKey: string): ApprovalCount {
  return getScreenRuleByKey(screenKey)?.approvalCount ?? 0;
}

export { isScreenWriteBlocked };

export function evaluateFieldApproval(input: {
  operationName: string;
  screenKey: string;
  fieldName: string;
  oldValue: unknown;
  newValue: unknown;
}): { requiredApprovals: ApprovalCount; matchedRuleId?: string } {
  const rule =
    getFieldRuleByOperation(input.operationName) ??
    getFieldApprovalRulesByScreenAndField(input.screenKey, input.fieldName);

  if (!rule) return { requiredApprovals: 0 };

  let required: ApprovalCount = rule.approvalCount;

  if (rule.scope === 'HighAmounts') {
    const num = Number(input.newValue);
    if (!Number.isFinite(num)) return { requiredApprovals: rule.approvalCount, matchedRuleId: rule.id };
    required = tierApprovalCount(
      num,
      rule.noApprovalLimit,
      rule.oneApprovalLimit,
      rule.approvalCount,
    );
  } else if (rule.scope === 'IncreasesOnly') {
    const oldN = Number(input.oldValue);
    const newN = Number(input.newValue);
    if (Number.isFinite(oldN) && Number.isFinite(newN) && newN <= oldN) {
      return { requiredApprovals: 0, matchedRuleId: rule.id };
    }
  }

  return { requiredApprovals: required, matchedRuleId: rule.id };
}

function getFieldApprovalRulesByScreenAndField(screenKey: string, fieldName: string) {
  const screen = getScreenByKey(screenKey);
  if (!screen) return undefined;
  return getFieldApprovalRulesStore().find(
    (r) => r.screenId === screen.screenId && r.fieldName === fieldName,
  );
}
