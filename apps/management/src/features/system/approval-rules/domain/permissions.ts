import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

export function canAccessApprovalRules(role: BackOfficeRole): boolean {
  return role === 'management' || isAllAccessRole(role);
}

export function canUpdateApprovalRules(role: BackOfficeRole): boolean {
  return role === 'management' || isAllAccessRole(role);
}
