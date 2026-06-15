import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

export function canAccessIntegrations(role: BackOfficeRole): boolean {
  return role === 'management' || isAllAccessRole(role);
}

export function canMutateIntegrations(role: BackOfficeRole): boolean {
  return role === 'management' || isAllAccessRole(role);
}
