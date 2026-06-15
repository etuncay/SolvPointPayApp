import type { ApprovalScope } from './types';

export const APPROVAL_SCOPES: ApprovalScope[] = ['FieldChanges', 'HighAmounts', 'IncreasesOnly'];

export function scopeRequiresLimits(scope: ApprovalScope): boolean {
  return scope === 'HighAmounts';
}

export function scopeLabelKey(scope: ApprovalScope): string {
  const map: Record<ApprovalScope, string> = {
    FieldChanges: 'ar_scope_field_changes',
    HighAmounts: 'ar_scope_high_amounts',
    IncreasesOnly: 'ar_scope_increases_only',
  };
  return map[scope];
}
