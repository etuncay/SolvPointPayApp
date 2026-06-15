import { getAppRoleById } from '@/mocks/app-roles';
import type { AppUser } from '@/mocks/app-users';

/** Geçici yetki + pasif rol + Inactive — runtime erişim kontrolü (§19 MVP) */
export function isUserAccessEffective(user: AppUser, now: Date): boolean {
  if (user.status !== 'Active') return false;
  if (!user.roleId) return false;
  const role = getAppRoleById(user.roleId);
  if (!role || role.status === 'Passive') return false;
  if (user.validFrom && now < new Date(user.validFrom)) return false;
  if (user.validTo) {
    const end = new Date(user.validTo);
    end.setHours(23, 59, 59, 999);
    if (now > end) return false;
  }
  return true;
}
