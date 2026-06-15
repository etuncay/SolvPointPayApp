import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

export function canAccessParameters(role: BackOfficeRole): boolean {
  return role === 'management' || isAllAccessRole(role);
}

export function canUpdateParameters(role: BackOfficeRole): boolean {
  return role === 'management' || isAllAccessRole(role);
}

export function canInsertParameters(role: BackOfficeRole): boolean {
  return canUpdateParameters(role);
}
