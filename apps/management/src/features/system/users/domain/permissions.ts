import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

export type UserModulePermissions = {
  list: boolean;
  view: boolean;
  assignRole: boolean;
};

export function getUserPermissions(role: BackOfficeRole): UserModulePermissions {
  if (isAllAccessRole(role)) {
    return { list: true, view: true, assignRole: true };
  }
  const isAdmin = role === 'management';
  return {
    list: isAdmin,
    view: isAdmin,
    assignRole: isAdmin,
  };
}

export function canAccessUsersModule(role: BackOfficeRole): boolean {
  return getUserPermissions(role).list;
}
