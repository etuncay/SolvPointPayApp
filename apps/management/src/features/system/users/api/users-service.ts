import type { BackOfficeRole } from '@epay/ui';
import type {
  AppUserDetail,
  AppUserFilters,
  AppUserListRow,
  UpdateRolePayload,
  UpdateRoleResult,
  UserActivityRow,
  UserRoleAuditEntry,
} from '../domain/types';

export interface UsersService {
  list(role: BackOfficeRole, filters: AppUserFilters): AppUserListRow[];
  getById(role: BackOfficeRole, userId: string): AppUserDetail | null;
  updateRole(
    role: BackOfficeRole,
    performedBy: string,
    userId: string,
    payload: UpdateRolePayload,
  ): UpdateRoleResult;
  getAuditLog(userId?: string): UserRoleAuditEntry[];
  getActivityLog(userId: string): UserActivityRow[];
}
