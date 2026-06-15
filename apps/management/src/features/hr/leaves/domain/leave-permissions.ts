import type { HrCurrentUserExtras } from '@/domain/hr-persona';
import type { LeaveListScope } from './types';
import { resolveLeaveListScope } from './leave-scope-filter';

export interface LeavePermissions {
  canViewList: boolean;
  canCreateLeave: boolean;
}

export function getLeavePermissions(extras: HrCurrentUserExtras): LeavePermissions {
  const scope = resolveLeaveListScope(extras);
  return {
    canViewList: scope != null,
    canCreateLeave: scope != null,
  };
}

export function canAccessLeaveRoutes(extras: HrCurrentUserExtras): boolean {
  return resolveLeaveListScope(extras) != null;
}

export { resolveLeaveListScope };
