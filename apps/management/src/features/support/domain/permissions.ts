import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { SupportCase } from './types';

export type SupportCasePermissions = {
  list: boolean;
  insert: boolean;
  viewAll: boolean;
};

export function getSupportCasePermissions(role: BackOfficeRole): SupportCasePermissions {
  if (isAllAccessRole(role)) {
    return { list: true, insert: true, viewAll: true };
  }
  if (role === 'ops' || role === 'management') {
    return { list: true, insert: true, viewAll: true };
  }
  if (role === 'finance' || role === 'compliance') {
    return { list: true, insert: false, viewAll: false };
  }
  return { list: false, insert: false, viewAll: false };
}

export function filterCasesByRole(
  role: BackOfficeRole,
  cases: SupportCase[],
  userId: string,
): SupportCase[] {
  const perms = getSupportCasePermissions(role);
  if (!perms.list) return [];
  if (perms.viewAll) return cases;
  return cases.filter(
    (c) => c.ownerUserId === userId || (c.departmentId != null && role === c.departmentId),
  );
}
