import type { BackOfficeRole } from '@epay/ui';
import { getAppUserById } from '@/mocks/app-users';
import { resolveUserCapabilities } from '@/features/system/roles/domain/resolve-user-capabilities';
import type { CurrentUser } from './types';
import { MOCK_USER_IDS } from './types';

const PERSONAS: Record<BackOfficeRole, CurrentUser> = {
  ops: {
    id: MOCK_USER_IDS.ops,
    displayName: 'Ahmet Yılmaz',
    role: 'ops',
    canFirstApprove: false,
    canSecondApprove: false,
  },
  compliance: {
    id: MOCK_USER_IDS.compliance,
    displayName: 'Ayşe Demir',
    role: 'compliance',
    canFirstApprove: true,
    canSecondApprove: false,
  },
  management: {
    id: MOCK_USER_IDS.management,
    displayName: 'Mehmet Şahin',
    role: 'management',
    canFirstApprove: false,
    canSecondApprove: true,
  },
  finance: {
    id: MOCK_USER_IDS.finance,
    displayName: 'Fatma Kaya',
    role: 'finance',
    canFirstApprove: false,
    canSecondApprove: false,
  },
  alltest: {
    id: 'u.alltest',
    displayName: 'All Test',
    role: 'alltest',
    canFirstApprove: true,
    canSecondApprove: true,
  },
};

export function getCurrentUser(role: BackOfficeRole): CurrentUser {
  const persona = PERSONAS[role];
  const caps = resolveUserCapabilities(persona.id);
  // roles-store'da kayıtlı değilse (ör. alltest) persona varsayılanları korunur.
  const fromRoleStore = caps != null && caps.roleId != null;
  return {
    ...persona,
    canFirstApprove: fromRoleStore ? caps.canFirstApprove : persona.canFirstApprove,
    canSecondApprove: fromRoleStore ? caps.canSecondApprove : persona.canSecondApprove,
  };
}

export function userNameById(id: string): string {
  const fromStore = getAppUserById(id);
  if (fromStore) return fromStore.fullName;
  for (const p of Object.values(PERSONAS)) {
    if (p.id === id) return p.displayName;
  }
  return id;
}
