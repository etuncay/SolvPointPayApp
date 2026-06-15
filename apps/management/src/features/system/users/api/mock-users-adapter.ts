import type { BackOfficeRole } from '@epay/ui';
import { getAppRoleById } from '@/mocks/app-roles';
import {
  getAppUserById,
  getAppUsersStore,
  roleNameForUser,
  updateAppUser,
  type AppUser,
} from '@/mocks/app-users';
import { getUserPermissions } from '../domain/permissions';
import { validateRoleAssignment } from '../domain/validation';
import { USER_ACTIVITY_LOG_SEED } from '@/mocks/user-activity-log';
import { userNameById } from '@/features/approval-pool/domain/current-user';
import type {
  AppUserDetail,
  AppUserFilters,
  AppUserListRow,
  UpdateRolePayload,
  UpdateRoleResult,
  UserActivityRow,
  UserRoleAuditEntry,
} from '../domain/types';
import type { UsersService } from './users-service';

function toDetail(user: AppUser): AppUserDetail {
  const role = getAppRoleById(user.roleId);
  return {
    ...user,
    roleName: roleNameForUser(user),
    roleStatus: role?.status ?? null,
  };
}

let auditLog: UserRoleAuditEntry[] = [];

function pushAudit(
  userId: string,
  field: UserRoleAuditEntry['field'],
  oldValue: string | null,
  newValue: string | null,
  performedBy: string,
) {
  auditLog = [
    {
      userId,
      field,
      oldValue,
      newValue,
      performedBy,
      at: new Date('2026-05-24T12:00:00Z').toISOString(),
    },
    ...auditLog,
  ];
}

function matchesQuery(user: AppUser, q: string): boolean {
  const lower = q.toLowerCase();
  return (
    user.fullName.toLowerCase().includes(lower) ||
    user.email.toLowerCase().includes(lower) ||
    user.phone.toLowerCase().includes(lower)
  );
}

export function resetUsersAuditLog(): void {
  auditLog = [];
}

export const usersService: UsersService = {
  list(role, filters) {
    if (!getUserPermissions(role).list) return [];
    let rows = [...getAppUsersStore()];
    if (filters.status !== 'any') {
      rows = rows.filter((u) => u.status === filters.status);
    }
    if (filters.roleId !== 'any') {
      if (filters.roleId === 'none') {
        rows = rows.filter((u) => !u.roleId);
      } else {
        rows = rows.filter((u) => u.roleId === filters.roleId);
      }
    }
    if (filters.query.trim()) {
      rows = rows.filter((u) => matchesQuery(u, filters.query.trim()));
    }
    return rows
      .sort((a, b) => a.fullName.localeCompare(b.fullName, 'tr'))
      .map(
        (u): AppUserListRow => ({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          roleName: roleNameForUser(u),
          createdAt: u.createdAt,
          status: u.status,
        }),
      );
  },

  getById(role, userId) {
    if (!getUserPermissions(role).view) return null;
    const user = getAppUserById(userId);
    return user ? toDetail(user) : null;
  },

  updateRole(role, performedBy, userId, payload) {
    if (!getUserPermissions(role).assignRole) {
      return { ok: false, errorCode: 'frd_forbidden' };
    }
    const user = getAppUserById(userId);
    if (!user) return { ok: false, errorCode: 'usr_not_found' };

    const err = validateRoleAssignment(payload);
    if (err === 'usr_passive_role_not_assignable') {
      return { ok: false, errorCode: 'usr_passive_role_not_assignable' };
    }
    if (err === 'usr_invalid_dates') {
      return { ok: false, errorCode: 'usr_invalid_dates' };
    }

    const validFrom = payload.validFrom ?? null;
    const validTo = payload.validTo ?? null;
    const roleId = payload.roleId;

    if (user.roleId !== roleId) {
      pushAudit(userId, 'roleId', user.roleId, roleId, performedBy);
    }
    if (user.validFrom !== validFrom) {
      pushAudit(userId, 'validFrom', user.validFrom, validFrom, performedBy);
    }
    if (user.validTo !== validTo) {
      pushAudit(userId, 'validTo', user.validTo, validTo, performedBy);
    }

    const updated = updateAppUser(userId, { roleId, validFrom, validTo });
    if (!updated) return { ok: false, errorCode: 'usr_not_found' };
    return { ok: true, user: toDetail(updated) };
  },

  getAuditLog(userId) {
    if (userId) return auditLog.filter((e) => e.userId === userId);
    return [...auditLog];
  },

  getActivityLog(userId) {
    const auditRows: UserActivityRow[] = auditLog
      .filter((e) => e.userId === userId)
      .map((e) => ({
        at: e.at,
        action: 'role_audit',
        module: 'system.users',
        detail: `${e.field}: ${e.oldValue ?? '—'} → ${e.newValue ?? '—'}`,
        ip: '—',
        performedBy: userNameById(e.performedBy),
        source: 'audit' as const,
      }));

    const activityRows: UserActivityRow[] = USER_ACTIVITY_LOG_SEED.filter((e) => e.userId === userId).map(
      (e) => ({
        at: e.at,
        action: e.action,
        module: e.module,
        detail: e.detail,
        ip: e.ip,
        source: 'activity' as const,
      }),
    );

    return [...auditRows, ...activityRows].sort((a, b) => b.at.localeCompare(a.at));
  },
};
