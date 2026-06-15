import { getAppUsersStore } from '@/mocks/app-users';
import { listActiveRoles, roleHasApproverFlag } from '@/mocks/roles-store';
import { isUserAccessEffective } from '@/features/system/users/domain/role-access-status';
import type { ApprovalCount, ApproverAvailabilityIssue } from './types';

const NOW = new Date('2026-05-24T12:00:00Z');

function hasActiveUserForRole(roleId: string): boolean {
  return getAppUsersStore().some(
    (u) => u.roleId === roleId && isUserAccessEffective(u, NOW),
  );
}

export function hasFirstApproverPool(): boolean {
  return listActiveRoles().some(
    (r) => roleHasApproverFlag(r.id, 'canFirstApprove') && hasActiveUserForRole(r.id),
  );
}

export function hasSecondApproverPool(): boolean {
  return listActiveRoles().some(
    (r) => roleHasApproverFlag(r.id, 'canSecondApprove') && hasActiveUserForRole(r.id),
  );
}

export function isApprovalCountStaffed(count: ApprovalCount): boolean {
  if (count === 0) return true;
  if (count === 1) return hasFirstApproverPool();
  return hasFirstApproverPool() && hasSecondApproverPool();
}

export function checkScreenApproverAvailability(
  screenKey: string,
  screenLabelKey: string,
  approvalCount: ApprovalCount,
): ApproverAvailabilityIssue | null {
  const missing: ('first' | 'second')[] = [];
  if (approvalCount >= 1 && !hasFirstApproverPool()) missing.push('first');
  if (approvalCount >= 2 && !hasSecondApproverPool()) missing.push('second');
  if (missing.length === 0) return null;
  return { screenKey, screenLabelKey, approvalCount, missing };
}

export function checkFieldRuleApproverAvailability(approvalCount: ApprovalCount): boolean {
  return isApprovalCountStaffed(approvalCount);
}
