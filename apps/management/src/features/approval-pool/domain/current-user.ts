import type { BackOfficeRole } from '@epay/ui';
import type { AuthUser } from '@epay/data';
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

/** @epay/data auth seed id → legacy app-users / onay seed id */
const AUTH_TO_LEGACY_APP_USER_ID: Record<string, string> = {
  'usr-ops': MOCK_USER_IDS.ops,
  'usr-fin': MOCK_USER_IDS.finance,
  'usr-comp': MOCK_USER_IDS.compliance,
  'usr-mgmt': MOCK_USER_IDS.management,
  'usr-alltest': 'u.alltest',
};

const LEGACY_TO_AUTH_USER_ID: Record<string, string> = Object.fromEntries(
  Object.entries(AUTH_TO_LEGACY_APP_USER_ID).map(([auth, legacy]) => [legacy, auth]),
);

export function resolveLegacyAppUserId(authUserId: string): string | null {
  return AUTH_TO_LEGACY_APP_USER_ID[authUserId] ?? null;
}

/** Oturum kullanıcısı ile mock kayıtlarındaki legacy id'leri eşleştirir. */
export function userIdsMatch(sessionUserId: string, recordUserId: string): boolean {
  if (sessionUserId === recordUserId) return true;
  const legacy = resolveLegacyAppUserId(sessionUserId);
  if (legacy != null && legacy === recordUserId) return true;
  const auth = LEGACY_TO_AUTH_USER_ID[recordUserId];
  return auth != null && auth === sessionUserId;
}

/**
 * Oturumdaki kullanıcı + etkin rol (demo override dahil) ile onay havuzu CurrentUser.
 * id/displayName oturumdan; onay yetkileri navigation rolü + roles-store.
 */
export function resolveCurrentUser(
  auth: Pick<AuthUser, 'id' | 'fullName' | 'role'> | null,
  navigationRole: BackOfficeRole,
): CurrentUser {
  if (!auth) return getCurrentUser(navigationRole);

  const persona = PERSONAS[navigationRole];
  const isDemoRoleMismatch = auth.role !== navigationRole;
  const capsLookupId = resolveLegacyAppUserId(auth.id) ?? auth.id;
  const caps = resolveUserCapabilities(capsLookupId);
  const fromRoleStore = !isDemoRoleMismatch && caps != null && caps.roleId != null;

  return {
    id: auth.id,
    displayName: auth.fullName,
    role: navigationRole,
    canFirstApprove: fromRoleStore ? caps.canFirstApprove : persona.canFirstApprove,
    canSecondApprove: fromRoleStore ? caps.canSecondApprove : persona.canSecondApprove,
  };
}

/** @deprecated Onay havuzunda resolveCurrentUser + useAuth kullanın */
export function getCurrentUser(role: BackOfficeRole): CurrentUser {
  const persona = PERSONAS[role];
  const caps = resolveUserCapabilities(persona.id);
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
  const legacy = resolveLegacyAppUserId(id);
  if (legacy) {
    const fromLegacy = getAppUserById(legacy);
    if (fromLegacy) return fromLegacy.fullName;
  }
  const authLegacy = AUTH_TO_LEGACY_APP_USER_ID[id];
  if (authLegacy) {
    const fromAuthLegacy = getAppUserById(authLegacy);
    if (fromAuthLegacy) return fromAuthLegacy.fullName;
  }
  return id;
}
