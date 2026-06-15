import { isAllAccessRole, type BackOfficeRole, type NavItem } from '@epay/ui';

/** Alt menü sırası — spec §4 (12.1 → 12.7) */
export const SYSTEM_CHILD_IDS = [
  'sys_users',
  'sys_approval_rules',
  'sys_roles',
  'sys_params',
  'sys_scheduled',
  'sys_notifications',
  'sys_integrations',
] as const;

export type SystemChildId = (typeof SYSTEM_CHILD_IDS)[number];

export const SYSTEM_CHILD_HREFS: Record<SystemChildId, string> = {
  sys_users: '/system/users',
  sys_approval_rules: '/system/approval-rules',
  sys_roles: '/system/roles',
  sys_params: '/system/parameters',
  sys_scheduled: '/system/jobs',
  sys_notifications: '/system/notifications',
  sys_integrations: '/system/integrations',
};

const PATH_PREFIX_ORDER: { prefix: string; id: SystemChildId }[] = [
  { prefix: '/system/approval-rules', id: 'sys_approval_rules' },
  { prefix: '/system/integrations', id: 'sys_integrations' },
  { prefix: '/system/notifications', id: 'sys_notifications' },
  { prefix: '/system/parameters', id: 'sys_params' },
  { prefix: '/system/jobs', id: 'sys_scheduled' },
  { prefix: '/system/roles', id: 'sys_roles' },
  { prefix: '/system/users', id: 'sys_users' },
];

export const SYSTEM_PATH_SUB_ID: Record<string, SystemChildId> = Object.fromEntries(
  PATH_PREFIX_ORDER.map(({ prefix, id }) => [prefix, id]),
) as Record<string, SystemChildId>;

export const SYSTEM_SUB_LABEL_KEYS: Record<SystemChildId, string> = {
  sys_users: 's_sys_users',
  sys_approval_rules: 's_sys_approval_rules',
  sys_roles: 's_sys_roles',
  sys_params: 'rm_panel_params',
  sys_scheduled: 's_sys_scheduled',
  sys_notifications: 's_sys_notifications',
  sys_integrations: 's_sys_integrations',
};

const SECTION_NO: Record<SystemChildId, string> = {
  sys_users: '12.1',
  sys_approval_rules: '12.2',
  sys_roles: '12.3',
  sys_params: '12.4',
  sys_scheduled: '12.5',
  sys_notifications: '12.6',
  sys_integrations: '12.7',
};

/** Spec §3 — MVP: yalnızca management tam erişim */
export function getVisibleSystemChildIds(role: BackOfficeRole): SystemChildId[] {
  if (role === 'management' || isAllAccessRole(role)) return [...SYSTEM_CHILD_IDS];
  return [];
}

export function canSeeSystemMenu(role: BackOfficeRole): boolean {
  return getVisibleSystemChildIds(role).length > 0;
}

export function getSystemMenuDefaultHref(role: BackOfficeRole): string | null {
  const ids = getVisibleSystemChildIds(role);
  if (ids.length === 0) return null;
  return SYSTEM_CHILD_HREFS[ids[0]!];
}

/** 12.3 sonrası sınırlı görüntüleme — MVP stub */
export function getSystemViewMode(role: BackOfficeRole): 'full' | 'readonly' | 'none' {
  if (role === 'management' || isAllAccessRole(role)) return 'full';
  return 'none';
}

export function getSystemSectionNo(subId: SystemChildId): string {
  return SECTION_NO[subId];
}

export function resolveSystemActiveSub(pathname: string): SystemChildId | null {
  if (!pathname.startsWith('/system')) return null;
  if (pathname === '/system') return 'sys_users';
  for (const { prefix, id } of PATH_PREFIX_ORDER) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return id;
  }
  return null;
}

/** Menü öğesini role göre filtrele — plan 8 ops deseni */
export function filterSystemMenuItem(item: NavItem, role: BackOfficeRole): NavItem | null {
  if (item.id !== 'system') return item;
  if (!canSeeSystemMenu(role)) return null;

  const visible = new Set(getVisibleSystemChildIds(role));
  const kids = (item.kids ?? [])
    .filter((k) => visible.has(k.id as SystemChildId))
    .map((k) => ({
      ...k,
      soon: undefined,
      href: SYSTEM_CHILD_HREFS[k.id as SystemChildId] ?? k.href,
    }));
  if (kids.length === 0) return null;

  return {
    ...item,
    soon: undefined,
    href: kids[0]!.href,
    kids,
  };
}
