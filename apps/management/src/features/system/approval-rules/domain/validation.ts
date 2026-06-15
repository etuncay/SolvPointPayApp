import { getFieldApprovalRulesStore } from '@/mocks/field-approval-rules';
import { scopeRequiresLimits } from './scopes';
import type { ApprovalScope, FieldApprovalRuleInput } from './types';

export function validateUniqueOperationName(
  operationName: string,
  excludeId?: string,
): string | null {
  const name = operationName.trim();
  if (!name) return 'ar_operation_required';
  const dup = getFieldApprovalRulesStore().find(
    (r) => r.operationName === name && r.id !== excludeId,
  );
  if (dup) return 'ar_operation_duplicate';
  return null;
}

export function normalizeFieldRuleInput(input: FieldApprovalRuleInput): FieldApprovalRuleInput {
  const limits = scopeRequiresLimits(input.scope);
  return {
    ...input,
    operationName: input.operationName.trim(),
    fieldName: input.fieldName.trim(),
    specialCondition: input.specialCondition?.trim() || null,
    noApprovalLimit: limits ? input.noApprovalLimit : null,
    oneApprovalLimit: limits ? input.oneApprovalLimit : null,
  };
}

export function validateFieldRuleLimits(
  scope: ApprovalScope,
  noApprovalLimit: number | null,
  oneApprovalLimit: number | null,
): string | null {
  if (!scopeRequiresLimits(scope)) return null;
  if (noApprovalLimit == null || oneApprovalLimit == null) return 'ar_limits_required';
  if (noApprovalLimit >= oneApprovalLimit) return 'ar_limits_order';
  return null;
}
