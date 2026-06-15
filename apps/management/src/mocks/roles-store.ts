import type { BackOfficeRole } from '@epay/ui';
import { mergeScreenPermissions } from '@/features/system/roles/domain/sync-matrix-from-registry';
import type {
  AppRole,
  AppRoleStatus,
  RoleFieldApprovalRow,
  ScreenPermissionRow,
} from '@/features/system/roles/domain/types';
import { getAppUsersStore } from './app-users';

const NOW = '2026-05-24T12:00:00Z';

type RoleSeed = Omit<AppRole, 'createdAt' | 'updatedAt'>;

const ROLE_SEEDS: RoleSeed[] = [
  {
    id: 'role-ops',
    name: 'Operasyon',
    description: 'Günlük operasyon ekranları',
    backOfficeRole: 'ops',
    status: 'Active',
  },
  {
    id: 'role-comp',
    name: 'Uyum',
    description: 'Uyum ve risk süreçleri',
    backOfficeRole: 'compliance',
    status: 'Active',
  },
  {
    id: 'role-fin',
    name: 'Finans',
    description: 'Finans ve mutabakat',
    backOfficeRole: 'finance',
    status: 'Active',
  },
  {
    id: 'role-mgmt',
    name: 'Yönetim',
    description: 'Tam yetki ve ikinci onay',
    backOfficeRole: 'management',
    status: 'Active',
  },
  {
    id: 'role-legacy',
    name: 'Legacy Ops',
    description: 'Pasif legacy rol',
    backOfficeRole: 'ops',
    status: 'Passive',
  },
];

function emptyMatrix(roleId: string): ScreenPermissionRow[] {
  return mergeScreenPermissions([], roleId);
}

function setFlags(
  rows: ScreenPermissionRow[],
  screenId: string,
  flags: Partial<Omit<ScreenPermissionRow, 'id' | 'roleId' | 'screenId' | 'screenKey' | 'moduleLabelKey' | 'screenLabelKey'>>,
): ScreenPermissionRow[] {
  return rows.map((r) => (r.screenId === screenId ? { ...r, ...flags } : r));
}

function buildRolePermissions(roleId: string, preset: (rows: ScreenPermissionRow[]) => ScreenPermissionRow[]): ScreenPermissionRow[] {
  return preset(emptyMatrix(roleId));
}

function seedPermissions(roleId: string): ScreenPermissionRow[] {
  switch (roleId) {
    case 'role-ops':
      return buildRolePermissions(roleId, (rows) => {
        let r = rows;
        for (const id of ['customers.list', 'agents.list', 'wallets.list', 'transfers.list', 'support.cases']) {
          r = setFlags(r, id, { canList: true, canView: true });
        }
        return r;
      });
    case 'role-comp':
      return buildRolePermissions(roleId, (rows) => {
        let r = rows;
        for (const id of ['risk.scores', 'risk.admin', 'approvals.pool', 'documents.list']) {
          r = setFlags(r, id, { canList: true, canView: true, canUpdate: true });
        }
        r = setFlags(r, 'approvals.pool', { canFirstApprove: true });
        return r;
      });
    case 'role-fin':
      return buildRolePermissions(roleId, (rows) => {
        let r = rows;
        for (const id of ['banks.reconciliation', 'transfers.list', 'wallets.list', 'agents.fees']) {
          r = setFlags(r, id, { canList: true, canView: true, canExport: true });
        }
        return r;
      });
    case 'role-mgmt':
      return buildRolePermissions(roleId, (rows) =>
        rows.map((r) => ({
          ...r,
          canList: true,
          canView: true,
          canInsert: true,
          canUpdate: true,
          canDelete: r.screenId !== 'system.users',
          canExport: true,
          canSecondApprove: r.screenId === 'approvals.pool',
        })),
      );
    default:
      return emptyMatrix(roleId);
  }
}

const FIELD_SEED: RoleFieldApprovalRow[] = [
  {
    id: 'rfa-001',
    roleId: 'role-comp',
    operationName: 'customer.fee.update',
    screenId: 'customers.fees',
    canFirstApprove: true,
    canSecondApprove: false,
  },
  {
    id: 'rfa-002',
    roleId: 'role-mgmt',
    operationName: 'approval.rule.update',
    screenId: 'system.users',
    canFirstApprove: false,
    canSecondApprove: true,
  },
];

let roles: AppRole[] = ROLE_SEEDS.map((s) => ({
  ...s,
  createdAt: '2024-01-01T08:00:00Z',
  updatedAt: NOW,
}));

let screenPermissions: ScreenPermissionRow[] = ROLE_SEEDS.flatMap((s) => seedPermissions(s.id));
let fieldApprovals: RoleFieldApprovalRow[] = FIELD_SEED.map((r) => ({ ...r }));
let permissionSeq = 1000;
let fieldSeq = 10;
let roleSeq = 6;

export function resetRolesStore(): void {
  roles = ROLE_SEEDS.map((s) => ({
    ...s,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: NOW,
  }));
  screenPermissions = ROLE_SEEDS.flatMap((s) => seedPermissions(s.id));
  fieldApprovals = FIELD_SEED.map((r) => ({ ...r }));
  permissionSeq = 1000;
  fieldSeq = 10;
  roleSeq = 6;
}

export function getRolesStore(): AppRole[] {
  return roles;
}

export function getRoleById(id: string): AppRole | undefined {
  return roles.find((r) => r.id === id);
}

/** 12.1 geriye dönük uyumluluk */
export type LegacyAppRole = {
  id: string;
  name: string;
  backOfficeRole?: BackOfficeRole;
  status: AppRoleStatus;
  canFirstApprove?: boolean;
  canSecondApprove?: boolean;
};

export function getAppRoleById(id: string | null): LegacyAppRole | undefined {
  if (!id) return undefined;
  const role = getRoleById(id);
  if (!role) return undefined;
  const perms = getScreenPermissionsForRole(id);
  return {
    id: role.id,
    name: role.name,
    backOfficeRole: role.backOfficeRole,
    status: role.status,
    canFirstApprove: perms.some((p) => p.canFirstApprove),
    canSecondApprove: perms.some((p) => p.canSecondApprove),
  };
}

export function listAssignableRoles(): LegacyAppRole[] {
  return roles
    .filter((r) => r.status === 'Active')
    .map((r) => getAppRoleById(r.id)!);
}

export function listAllAppRoles(): LegacyAppRole[] {
  return roles.map((r) => getAppRoleById(r.id)!);
}

export function listActiveRoles(): AppRole[] {
  return roles.filter((r) => r.status === 'Active');
}

export function countUsersWithRole(roleId: string): number {
  return getAppUsersStore().filter((u) => u.roleId === roleId).length;
}

export function getScreenPermissionsForRole(roleId: string): ScreenPermissionRow[] {
  return mergeScreenPermissions(
    screenPermissions.filter((p) => p.roleId === roleId),
    roleId,
  );
}

export function getFieldApprovalsForRole(roleId: string): RoleFieldApprovalRow[] {
  return fieldApprovals.filter((f) => f.roleId === roleId);
}

export function getRoleDetailSnapshot(roleId: string) {
  const role = getRoleById(roleId);
  if (!role) return null;
  return {
    role,
    screenPermissions: getScreenPermissionsForRole(roleId),
    fieldApprovals: getFieldApprovalsForRole(roleId),
    assignedUserCount: countUsersWithRole(roleId),
  };
}

export function getScreenPermission(
  roleId: string,
  screenKey: string,
): ScreenPermissionRow | null {
  return getScreenPermissionsForRole(roleId).find((p) => p.screenKey === screenKey) ?? null;
}

export function roleHasApproverFlag(
  roleId: string,
  flag: 'canFirstApprove' | 'canSecondApprove',
): boolean {
  const role = getRoleById(roleId);
  if (!role || role.status !== 'Active') return false;
  return getScreenPermissionsForRole(roleId).some((p) => p[flag]);
}

export function appendRole(input: { name: string; description: string }): AppRole {
  const id = `role-${roleSeq++}`;
  const role: AppRole = {
    id,
    name: input.name.trim(),
    description: input.description.trim(),
    status: 'Active',
    createdAt: NOW,
    updatedAt: NOW,
  };
  roles = [...roles, role];
  screenPermissions = [...screenPermissions, ...emptyMatrix(id)];
  return role;
}

export function updateRoleRecord(
  id: string,
  patch: Partial<Pick<AppRole, 'name' | 'description' | 'status'>>,
): AppRole | undefined {
  const idx = roles.findIndex((r) => r.id === id);
  if (idx < 0) return undefined;
  const next = { ...roles[idx]!, ...patch, updatedAt: NOW };
  roles = [...roles.slice(0, idx), next, ...roles.slice(idx + 1)];
  return next;
}

export function replaceScreenPermissions(roleId: string, rows: ScreenPermissionRow[]): void {
  screenPermissions = [
    ...screenPermissions.filter((p) => p.roleId !== roleId),
    ...rows.map((r) => ({ ...r, roleId })),
  ];
}

export function replaceFieldApprovals(roleId: string, rows: RoleFieldApprovalRow[]): void {
  fieldApprovals = [
    ...fieldApprovals.filter((f) => f.roleId !== roleId),
    ...rows.map((r) => ({
      ...r,
      id: r.id.startsWith('rfa-new') ? `rfa-${fieldSeq++}` : r.id,
      roleId,
    })),
  ];
}

export const APP_ROLES_SEED = roles;
