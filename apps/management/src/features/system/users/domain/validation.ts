import { getAppRoleById } from '@/mocks/app-roles';
import type { UpdateRolePayload } from './types';

export function validateDateRange(validFrom: string | null, validTo: string | null): boolean {
  if (!validFrom || !validTo) return true;
  return new Date(validFrom).getTime() <= new Date(validTo).getTime();
}

export function validateRoleAssignment(payload: UpdateRolePayload): string | null {
  if (payload.roleId) {
    const role = getAppRoleById(payload.roleId);
    if (!role) return 'usr_not_found';
    if (role.status === 'Passive') return 'usr_passive_role_not_assignable';
  }
  const from = payload.validFrom ?? null;
  const to = payload.validTo ?? null;
  if (!validateDateRange(from, to)) return 'usr_invalid_dates';
  return null;
}
