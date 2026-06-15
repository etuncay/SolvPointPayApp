import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import { canApprove, canReject, canWithdraw } from './transitions';
import type { ApprovalPermissions, ApprovalRequest, CurrentUser } from './types';

export function getApprovalPoolPermissions(role: BackOfficeRole): ApprovalPermissions {
  if (isAllAccessRole(role)) {
    return { list: true, view: true, approve: true, reject: true, withdraw: true };
  }
  switch (role) {
    case 'ops':
      return { list: true, view: true, approve: false, reject: false, withdraw: true };
    case 'compliance':
      return { list: true, view: true, approve: true, reject: true, withdraw: false };
    case 'management':
      return { list: true, view: true, approve: true, reject: true, withdraw: false };
    case 'finance':
      return { list: true, view: true, approve: false, reject: false, withdraw: false };
    default:
      return { list: false, view: false, approve: false, reject: false, withdraw: false };
  }
}

export function rowCanApprove(user: CurrentUser, r: ApprovalRequest): boolean {
  return getApprovalPoolPermissions(user.role).approve && canApprove(user, r);
}

export function rowCanReject(user: CurrentUser, r: ApprovalRequest): boolean {
  return getApprovalPoolPermissions(user.role).approve && canReject(user, r);
}

export function rowCanWithdraw(user: CurrentUser, r: ApprovalRequest): boolean {
  return getApprovalPoolPermissions(user.role).withdraw && canWithdraw(user, r);
}
