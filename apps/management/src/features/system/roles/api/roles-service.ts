import type { BackOfficeRole } from '@epay/ui';
import type {
  AppRole,
  CreateRoleInput,
  RoleDetail,
  RoleListRow,
  UpdateRolePayload,
} from '../domain/types';

export type CreateRoleResult =
  | { ok: true; role: AppRole }
  | { ok: false; errorCode: string };

export type UpdateRoleResult =
  | { ok: true; detail: RoleDetail }
  | { ok: false; errorCode: string };

export interface RolesService {
  list(role: BackOfficeRole): RoleListRow[];
  getById(role: BackOfficeRole, roleId: string): RoleDetail | null;
  create(role: BackOfficeRole, input: CreateRoleInput): CreateRoleResult;
  update(role: BackOfficeRole, roleId: string, payload: UpdateRolePayload): UpdateRoleResult;
  getAuditLog(roleId?: string): RoleAuditEntry[];
}

export type RoleAuditEntry = {
  at: string;
  roleId: string;
  field: string;
  oldValue: string;
  newValue: string;
};
