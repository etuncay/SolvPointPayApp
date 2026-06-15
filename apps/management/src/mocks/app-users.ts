import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import { getAppRoleById } from './app-roles';

export type AppUserStatus = 'Active' | 'Inactive';

export interface AppUser {
  id: string;
  userNo: string;
  hrEmployeeId: string | null;
  fullName: string;
  email: string;
  phone: string;
  roleId: string | null;
  validFrom: string | null;
  validTo: string | null;
  status: AppUserStatus;
  createdAt: string;
  updatedAt: string;
}

const SEED: AppUser[] = [
  {
    id: MOCK_USER_IDS.ops,
    userNo: 'USR-00001',
    hrEmployeeId: 'emp-001',
    fullName: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@epay.demo',
    phone: '+90 532 100 0001',
    roleId: 'role-ops',
    validFrom: null,
    validTo: null,
    status: 'Active',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2025-11-01T10:00:00Z',
  },
  {
    id: MOCK_USER_IDS.compliance,
    userNo: 'USR-00002',
    hrEmployeeId: 'emp-002',
    fullName: 'Ayşe Demir',
    email: 'ayse.demir@epay.demo',
    phone: '+90 532 100 0002',
    roleId: 'role-comp',
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    status: 'Active',
    createdAt: '2024-02-20T08:00:00Z',
    updatedAt: '2026-03-01T09:00:00Z',
  },
  {
    id: MOCK_USER_IDS.finance,
    userNo: 'USR-00003',
    hrEmployeeId: 'emp-003',
    fullName: 'Fatma Kaya',
    email: 'fatma.kaya@epay.demo',
    phone: '+90 532 100 0003',
    roleId: 'role-fin',
    validFrom: null,
    validTo: null,
    status: 'Active',
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2025-12-15T11:00:00Z',
  },
  {
    id: MOCK_USER_IDS.management,
    userNo: 'USR-00004',
    hrEmployeeId: 'emp-004',
    fullName: 'Mehmet Şahin',
    email: 'mehmet.sahin@epay.demo',
    phone: '+90 532 100 0004',
    roleId: 'role-mgmt',
    validFrom: null,
    validTo: null,
    status: 'Active',
    createdAt: '2023-11-01T08:00:00Z',
    updatedAt: '2026-01-20T14:00:00Z',
  },
  {
    id: 'usr-005',
    userNo: 'USR-00005',
    hrEmployeeId: 'emp-005',
    fullName: 'Zeynep Akın',
    email: 'zeynep.akin@epay.demo',
    phone: '+90 532 100 0005',
    roleId: null,
    validFrom: null,
    validTo: null,
    status: 'Active',
    createdAt: '2025-06-01T08:00:00Z',
    updatedAt: '2025-06-01T08:00:00Z',
  },
  {
    id: 'usr-006',
    userNo: 'USR-00006',
    hrEmployeeId: 'emp-006',
    fullName: 'Can Öztürk',
    email: 'can.ozturk@epay.demo',
    phone: '+90 532 100 0006',
    roleId: 'role-ops',
    validFrom: null,
    validTo: null,
    status: 'Inactive',
    createdAt: '2022-08-12T08:00:00Z',
    updatedAt: '2026-02-28T16:00:00Z',
  },
  {
    id: 'usr-007',
    userNo: 'USR-00007',
    hrEmployeeId: 'emp-007',
    fullName: 'Elif Yıldız',
    email: 'elif.yildiz@epay.demo',
    phone: '+90 532 100 0007',
    roleId: 'role-legacy',
    validFrom: null,
    validTo: null,
    status: 'Active',
    createdAt: '2024-09-05T08:00:00Z',
    updatedAt: '2025-10-10T12:00:00Z',
  },
];

let store: AppUser[] = SEED.map((u) => ({ ...u }));

export function resetAppUsersStore(): void {
  store = SEED.map((u) => ({ ...u }));
}

export function getAppUsersStore(): AppUser[] {
  return store;
}

export function getAppUserById(id: string): AppUser | undefined {
  return store.find((u) => u.id === id);
}

export function appendAppUser(user: AppUser): AppUser {
  store = [...store, user];
  return user;
}

export function updateAppUser(id: string, patch: Partial<AppUser>): AppUser | undefined {
  const idx = store.findIndex((u) => u.id === id);
  if (idx < 0) return undefined;
  const next = { ...store[idx]!, ...patch, updatedAt: new Date('2026-05-24T12:00:00Z').toISOString() };
  store = [...store.slice(0, idx), next, ...store.slice(idx + 1)];
  return next;
}

export function userDisplayNameById(id: string): string {
  return getAppUserById(id)?.fullName ?? id;
}

export function roleNameForUser(user: AppUser): string | null {
  const role = getAppRoleById(user.roleId);
  return role?.name ?? null;
}
