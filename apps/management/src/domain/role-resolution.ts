import type { BackOfficeRole } from '@epay/ui';

export const BACK_OFFICE_ROLES: BackOfficeRole[] = [
  'ops',
  'finance',
  'compliance',
  'management',
  'alltest',
];

export const DEMO_ROLE_QUERY_PARAM = 'demoRole';
export const DEMO_ROLE_OVERRIDE_KEY = 'epay-demo-role-override';
/** @deprecated Oturum açıkken kullanılmaz; temizlenir. */
export const LEGACY_ROLE_STORAGE_KEY = 'epay-backoffice-role';

export function isBackOfficeRole(value: string | null | undefined): value is BackOfficeRole {
  return value != null && BACK_OFFICE_ROLES.includes(value as BackOfficeRole);
}

export function readDemoRoleFromUrl(search: string): BackOfficeRole | null {
  const params = new URLSearchParams(search);
  const demo = params.get(DEMO_ROLE_QUERY_PARAM);
  if (isBackOfficeRole(demo)) return demo;
  return null;
}

export function readDeprecatedRoleFromUrl(search: string): BackOfficeRole | null {
  const legacy = new URLSearchParams(search).get('role');
  return isBackOfficeRole(legacy) ? legacy : null;
}

export function readDemoRoleOverride(storage: Storage | null): BackOfficeRole | null {
  if (!storage) return null;
  try {
    const stored = storage.getItem(DEMO_ROLE_OVERRIDE_KEY);
    return isBackOfficeRole(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function resolveEffectiveRole(input: {
  accountRole: BackOfficeRole | null;
  demoOverride: BackOfficeRole | null;
  guestRole: BackOfficeRole;
}): BackOfficeRole {
  if (input.accountRole) {
    return input.demoOverride ?? input.accountRole;
  }
  return input.guestRole;
}

export function nextRoleInCycle(current: BackOfficeRole): BackOfficeRole {
  const i = BACK_OFFICE_ROLES.indexOf(current);
  return BACK_OFFICE_ROLES[(i + 1) % BACK_OFFICE_ROLES.length]!;
}

export function clearDemoRoleStorage(): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem(DEMO_ROLE_OVERRIDE_KEY);
    sessionStorage.removeItem(LEGACY_ROLE_STORAGE_KEY);
  } catch {
    /* private mode */
  }
}
