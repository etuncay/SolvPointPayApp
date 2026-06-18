import type { BackOfficeRole } from '@epay/ui';
import type { AuthUser } from '@epay/data';
import { isBackOfficeRole } from './role-resolution';

/** Menü, route guard ve dashboard widget'ları için etkin rol. */
export function resolveNavigationRole(input: {
  accountRole: BackOfficeRole | null;
  effectiveRole: BackOfficeRole;
}): BackOfficeRole {
  return input.effectiveRole;
}

/**
 * Demo override yokken menü rolü = oturum (hesap) rolü olmalı.
 * Override varken kasıtlı fark — senkron sayılır.
 */
export function isNavigationRoleSyncedWithSession(input: {
  accountRole: BackOfficeRole | null;
  effectiveRole: BackOfficeRole;
  isDemoRoleOverride: boolean;
}): boolean {
  if (!input.accountRole) return true;
  if (input.isDemoRoleOverride) return true;
  return input.effectiveRole === input.accountRole;
}

/** sessionStorage oturumundaki rol geçerli değilse oturumu reddet. */
export function sanitizeAuthUser(user: AuthUser | null): AuthUser | null {
  if (!user) return null;
  if (!isBackOfficeRole(user.role)) return null;
  if (!user.id?.trim() || !user.email?.trim()) return null;
  return user;
}
