import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

export function canAccessRolesModule(role: BackOfficeRole): boolean {
  return role === 'management' || isAllAccessRole(role);
}

export function canMutateRoles(role: BackOfficeRole): boolean {
  return role === 'management' || isAllAccessRole(role);
}
