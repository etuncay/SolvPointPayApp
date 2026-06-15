import type { BackofficeScreenDef } from '@/features/system/shared/screen-registry';

export type ApprovalCount = 0 | 1 | 2;

export type ApprovalScope = 'FieldChanges' | 'HighAmounts' | 'IncreasesOnly';

export interface ScreenApprovalRule {
  id: string;
  moduleId: string;
  screenId: string;
  screenKey: string;
  moduleLabelKey: string;
  screenLabelKey: string;
  approvalCount: ApprovalCount;
}

export interface FieldApprovalRule {
  id: string;
  operationName: string;
  screenId: string;
  fieldName: string;
  specialCondition: string | null;
  scope: ApprovalScope;
  approvalCount: ApprovalCount;
  noApprovalLimit: number | null;
  oneApprovalLimit: number | null;
}

export type FieldApprovalRuleInput = Omit<FieldApprovalRule, 'id'>;

export type ApproverAvailabilityIssue = {
  screenKey: string;
  screenLabelKey: string;
  approvalCount: ApprovalCount;
  missing: ('first' | 'second')[];
};

export type ValidateFieldRuleInput = {
  screenId: string;
  fieldName: string;
  specialCondition?: string | null;
};

export type ValidateFieldRuleResult = { ok: boolean; errors: string[] };

export type ScreenRuleRowView = ScreenApprovalRule;

export function screenDefToRule(
  def: BackofficeScreenDef,
  approvalCount: ApprovalCount,
  id: string,
): ScreenApprovalRule {
  return {
    id,
    moduleId: def.moduleId,
    screenId: def.screenId,
    screenKey: def.screenKey,
    moduleLabelKey: def.moduleLabelKey,
    screenLabelKey: def.labelKey,
    approvalCount,
  };
}
