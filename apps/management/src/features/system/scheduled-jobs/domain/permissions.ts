import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

export function canAccessScheduledJobs(role: BackOfficeRole): boolean {
  return role === 'management' || isAllAccessRole(role);
}

export function canMutateScheduledJobs(role: BackOfficeRole): boolean {
  return role === 'management' || isAllAccessRole(role);
}
