import type { BackOfficeRole } from '@epay/ui';
import {
  appendRole,
  countUsersWithRole,
  getRoleDetailSnapshot,
  getRolesStore,
  replaceFieldApprovals,
  replaceScreenPermissions,
  updateRoleRecord,
} from '@/mocks/roles-store';
import { PERMISSION_FLAG_KEYS } from '../domain/permission-flags';
import { canAccessRolesModule, canMutateRoles } from '../domain/permissions';
import {
  validateStatusChange,
  validateUniqueRoleName,
} from '../domain/validation';
import type { RoleListRow, UpdateRolePayload } from '../domain/types';
import type { CreateRoleInput } from '../domain/types';
import type { RoleAuditEntry, RolesService } from './roles-service';

let auditLog: RoleAuditEntry[] = [];

function log(roleId: string, field: string, oldValue: string, newValue: string) {
  auditLog = [
    {
      at: new Date('2026-05-24T12:00:00Z').toISOString(),
      roleId,
      field,
      oldValue,
      newValue,
    },
    ...auditLog,
  ];
}

export function resetRolesAuditLog(): void {
  auditLog = [];
}

export const rolesService: RolesService = {
  list(role) {
    if (!canAccessRolesModule(role)) return [];
    return getRolesStore().map(
      (r): RoleListRow => ({
        id: r.id,
        name: r.name,
        description: r.description,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        assignedUserCount: countUsersWithRole(r.id),
      }),
    );
  },

  getById(role, roleId) {
    if (!canAccessRolesModule(role)) return null;
    const snap = getRoleDetailSnapshot(roleId);
    return snap;
  },

  create(role, input: CreateRoleInput) {
    if (!canMutateRoles(role)) return { ok: false, errorCode: 'frd_forbidden' };
    const dup = validateUniqueRoleName(input.name);
    if (dup) return { ok: false, errorCode: dup };
    const created = appendRole(input);
    log(created.id, 'name', '', created.name);
    return { ok: true, role: created };
  },

  update(role, roleId, payload: UpdateRolePayload) {
    if (!canMutateRoles(role)) return { ok: false, errorCode: 'frd_forbidden' };
    const before = getRoleDetailSnapshot(roleId);
    if (!before) return { ok: false, errorCode: 'rol_not_found' };

    if (payload.name != null) {
      const dup = validateUniqueRoleName(payload.name, roleId);
      if (dup) return { ok: false, errorCode: dup };
      if (payload.name !== before.role.name) {
        log(roleId, 'name', before.role.name, payload.name);
        updateRoleRecord(roleId, { name: payload.name.trim() });
      }
    }

    if (payload.description != null && payload.description !== before.role.description) {
      log(roleId, 'description', before.role.description, payload.description);
      updateRoleRecord(roleId, { description: payload.description.trim() });
    }

    if (payload.status != null && payload.status !== before.role.status) {
      const err = validateStatusChange(roleId, payload.status, before.assignedUserCount);
      if (err) return { ok: false, errorCode: err };
      log(roleId, 'status', before.role.status, payload.status);
      updateRoleRecord(roleId, { status: payload.status });
    }

    if (payload.screenPermissions) {
      for (const row of payload.screenPermissions) {
        const prev = before.screenPermissions.find((p) => p.screenId === row.screenId);
        if (!prev) continue;
        for (const flag of PERMISSION_FLAG_KEYS) {
          if (prev[flag] !== row[flag]) {
            log(roleId, `${row.screenKey}.${flag}`, String(prev[flag]), String(row[flag]));
          }
        }
      }
      replaceScreenPermissions(roleId, payload.screenPermissions);
    }

    if (payload.fieldApprovals) {
      replaceFieldApprovals(roleId, payload.fieldApprovals);
      log(roleId, 'fieldApprovals', String(before.fieldApprovals.length), String(payload.fieldApprovals.length));
    }

    const after = getRoleDetailSnapshot(roleId);
    if (!after) return { ok: false, errorCode: 'rol_not_found' };
    return { ok: true, detail: after };
  },

  getAuditLog(roleId) {
    if (roleId) return auditLog.filter((e) => e.roleId === roleId);
    return [...auditLog];
  },
};
