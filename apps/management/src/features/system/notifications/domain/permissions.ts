import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

export function canAccessNotifications(role: BackOfficeRole): boolean {
  return role === 'management' || isAllAccessRole(role);
}

export function canMutateNotifications(role: BackOfficeRole): boolean {
  return role === 'management' || isAllAccessRole(role);
}
