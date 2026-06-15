import { getRolesStore } from '@/mocks/roles-store';
import type { AppRoleStatus } from './types';

export function validateUniqueRoleName(name: string, excludeId?: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'rol_name_required';
  const dup = getRolesStore().find(
    (r) => r.name.toLowerCase() === trimmed.toLowerCase() && r.id !== excludeId,
  );
  if (dup) return 'rol_name_duplicate';
  return null;
}

export function canAssignPassiveRole(roleId: string): boolean {
  const role = getRolesStore().find((r) => r.id === roleId);
  return role?.status !== 'Passive';
}

export function validateStatusChange(
  roleId: string,
  status: AppRoleStatus,
  assignedCount: number,
): string | null {
  if (status === 'Passive' && assignedCount > 0) {
    return 'rol_passive_has_users';
  }
  return null;
}
