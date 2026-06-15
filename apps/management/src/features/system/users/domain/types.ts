import type { AppUser, AppUserStatus } from '@/mocks/app-users';

export type { AppUser, AppUserStatus };

export type AppUserListRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  roleName: string | null;
  createdAt: string;
  status: AppUserStatus;
};

export type AppUserDetail = AppUser & {
  roleName: string | null;
  roleStatus: 'Active' | 'Passive' | null;
};

export type AppUserFilters = {
  query: string;
  roleId: string;
  status: 'any' | AppUserStatus;
};

export const DEFAULT_APP_USER_FILTERS: AppUserFilters = {
  query: '',
  roleId: 'any',
  status: 'any',
};

export type UpdateRolePayload = {
  roleId: string | null;
  validFrom?: string | null;
  validTo?: string | null;
};

export type UserRoleAuditEntry = {
  userId: string;
  field: 'roleId' | 'validFrom' | 'validTo';
  oldValue: string | null;
  newValue: string | null;
  performedBy: string;
  at: string;
};

export type UserActivityRow = {
  at: string;
  action: string;
  module: string;
  detail: string;
  ip: string;
  performedBy?: string;
  source: 'audit' | 'activity';
};

export type UpdateRoleResult =
  | { ok: true; user: AppUserDetail }
  | { ok: false; errorCode: 'usr_passive_role_not_assignable' | 'usr_not_found' | 'frd_forbidden' | 'usr_invalid_dates' };
