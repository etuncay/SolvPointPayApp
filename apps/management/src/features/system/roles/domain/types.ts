import type { BackOfficeRole } from '@epay/ui';
import type { PermissionFlags } from './permission-flags';

export type AppRoleStatus = 'Active' | 'Passive';

export interface AppRole {
  id: string;
  name: string;
  description: string;
  backOfficeRole?: BackOfficeRole;
  status: AppRoleStatus;
  createdAt: string;
  updatedAt: string;
}

export type RoleListRow = {
  id: string;
  name: string;
  description: string;
  status: AppRoleStatus;
  createdAt: string;
  updatedAt: string;
  assignedUserCount: number;
};

export type ScreenPermissionRow = {
  id: string;
  roleId: string;
  screenId: string;
  screenKey: string;
  moduleLabelKey: string;
  screenLabelKey: string;
} & PermissionFlags;

export type RoleFieldApprovalRow = {
  id: string;
  roleId: string;
  operationName: string;
  screenId: string;
  canFirstApprove: boolean;
  canSecondApprove: boolean;
};

export type RoleDetail = {
  role: AppRole;
  screenPermissions: ScreenPermissionRow[];
  fieldApprovals: RoleFieldApprovalRow[];
  assignedUserCount: number;
};

export type CreateRoleInput = {
  name: string;
  description: string;
};

export type UpdateRolePayload = {
  name?: string;
  description?: string;
  status?: AppRoleStatus;
  screenPermissions?: ScreenPermissionRow[];
  fieldApprovals?: RoleFieldApprovalRow[];
};

export type UserCapabilities = {
  userId: string;
  roleId: string | null;
  canFirstApprove: boolean;
  canSecondApprove: boolean;
  screenPermissions: ScreenPermissionRow[];
};
