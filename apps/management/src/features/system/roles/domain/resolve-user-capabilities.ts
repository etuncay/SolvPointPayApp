import { getAppUserById } from '@/mocks/app-users';
import {
  getRoleDetailSnapshot,
  getScreenPermission,
} from '@/mocks/roles-store';
import type { UserCapabilities } from './types';

/** 8.1 / 12.2 tüketici — kullanıcı rolünden yetki türetimi */
export function resolveUserCapabilities(userId: string): UserCapabilities | null {
  const user = getAppUserById(userId);
  if (!user || !user.roleId) {
    return {
      userId,
      roleId: null,
      canFirstApprove: false,
      canSecondApprove: false,
      screenPermissions: [],
    };
  }

  const detail = getRoleDetailSnapshot(user.roleId);
  if (!detail) return null;

  const perms = detail.screenPermissions;
  return {
    userId,
    roleId: user.roleId,
    canFirstApprove: perms.some((p) => p.canFirstApprove),
    canSecondApprove: perms.some((p) => p.canSecondApprove),
    screenPermissions: perms,
  };
}

export { getScreenPermission, listActiveRoles } from '@/mocks/roles-store';
