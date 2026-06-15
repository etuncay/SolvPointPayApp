import { getAppRoleById } from '@/mocks/app-roles';
import {
  appendAppUser,
  getAppUsersStore,
  type AppUser,
  updateAppUser,
  userDisplayNameById,
} from '@/mocks/app-users';

/** Plan 13 HR entegrasyonu için minimal personel stub */
export type HrEmployeeStub = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
};

let userSeq = 8;

function nextUserNo(): string {
  const n = userSeq++;
  return `USR-${String(n).padStart(5, '0')}`;
}

export function provisionUserFromEmployee(employee: HrEmployeeStub): AppUser {
  const existing = getAppUsersStore().find((u) => u.hrEmployeeId === employee.id);
  if (existing) return existing;

  const now = new Date('2026-05-24T12:00:00Z').toISOString();
  const user: AppUser = {
    id: `usr-hr-${employee.id}`,
    userNo: nextUserNo(),
    hrEmployeeId: employee.id,
    fullName: employee.fullName,
    email: employee.email,
    phone: employee.phone,
    roleId: null,
    validFrom: null,
    validTo: null,
    status: employee.status === 'Inactive' ? 'Inactive' : 'Active',
    createdAt: now,
    updatedAt: now,
  };
  return appendAppUser(user);
}

export function markUserInactiveByEmployeeId(hrEmployeeId: string): void {
  syncInactiveFromHr(hrEmployeeId);
}

export function syncInactiveFromHr(hrEmployeeId: string): AppUser | undefined {
  const user = getAppUsersStore().find((u) => u.hrEmployeeId === hrEmployeeId);
  if (!user) return undefined;
  return updateAppUser(user.id, { status: 'Inactive' });
}

export function resolveUserName(id: string): string {
  return userDisplayNameById(id);
}

export function roleLabelForUser(user: AppUser): string | null {
  return getAppRoleById(user.roleId)?.name ?? null;
}
