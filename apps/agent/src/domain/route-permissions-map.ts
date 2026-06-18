import type { ForbiddenPageProps } from '@/pages/forbidden-page';
import type { AgentAuthorizedProfile } from './agent-session';
import { getAgentPermissions } from './permissions';

export type AgentRoutePermissionChecker = (profile: AgentAuthorizedProfile) => boolean;

export interface AgentRoutePermissionDefinition {
  key: AgentRoutePermissionKey;
  paths: readonly string[];
  check: AgentRoutePermissionChecker;
  forbidden?: ForbiddenPageProps;
}

/** Agent route izin anahtarları — `permissions.ts` modülleri ile hizalı. */
export type AgentRoutePermissionKey =
  | 'accounts.view'
  | 'customers.list'
  | 'customers.create'
  | 'customers.edit'
  | 'withdrawal.access'
  | 'transfers.access'
  | 'transactions.list'
  | 'transactions.view'
  | 'transactions.approve'
  | 'feedback.access'
  | 'playground.access';

export const AGENT_ROUTE_PERMISSIONS: readonly AgentRoutePermissionDefinition[] = [
  {
    key: 'accounts.view',
    paths: ['accounts'],
    check: (p) => getAgentPermissions(p).accounts.view,
  },
  {
    key: 'customers.list',
    paths: ['customers'],
    check: (p) => getAgentPermissions(p).customers.list,
  },
  {
    key: 'customers.create',
    paths: ['customers/new'],
    check: (p) => getAgentPermissions(p).customers.create,
    forbidden: { subtitleKey: 'ag_forbidden_customers', backTo: '/customers' },
  },
  {
    key: 'customers.edit',
    paths: ['customers/:customerId'],
    check: (p) => getAgentPermissions(p).customers.edit,
    forbidden: { subtitleKey: 'ag_forbidden_customers', backTo: '/customers' },
  },
  {
    key: 'withdrawal.access',
    paths: ['withdrawal'],
    check: (p) => getAgentPermissions(p).withdrawal.access,
    forbidden: { subtitleKey: 'ag_forbidden_transact', backTo: '/' },
  },
  {
    key: 'transfers.access',
    paths: [
      'transfers/own-wallet',
      'transfers/bank-account',
      'transfers/person',
      'transfers/abroad',
    ],
    check: (p) => getAgentPermissions(p).transfers.access,
    forbidden: { subtitleKey: 'ag_forbidden_transact', backTo: '/' },
  },
  {
    key: 'transactions.list',
    paths: ['transactions'],
    check: (p) => getAgentPermissions(p).transactions.list,
  },
  {
    key: 'transactions.view',
    paths: ['transactions/:id'],
    check: (p) => getAgentPermissions(p).transactions.view,
  },
  {
    key: 'transactions.approve',
    paths: [
      'transactions/:id/approve',
      'transactions/:id/signed-receipt',
      'transactions/:id/success',
    ],
    check: (p) => getAgentPermissions(p).transactions.approve,
    forbidden: { subtitleKey: 'ag_forbidden_approve', backTo: '/transactions' },
  },
  {
    key: 'feedback.access',
    paths: ['feedback'],
    check: (p) => getAgentPermissions(p).feedback.access,
  },
  {
    key: 'playground.access',
    paths: [
      'playground',
      'playground/new',
      'playground/edit/:id',
      'playground/delete/:id',
      'playground/view/:id',
    ],
    check: (p) => getAgentPermissions(p).playground.access,
  },
] as const;

const ROUTE_PERMISSION_BY_KEY = Object.fromEntries(
  AGENT_ROUTE_PERMISSIONS.map((def) => [def.key, def]),
) as Record<AgentRoutePermissionKey, AgentRoutePermissionDefinition>;

const ROUTE_PATH_ENTRIES = AGENT_ROUTE_PERMISSIONS.flatMap((def) =>
  def.paths.map((path) => ({ path, permission: def.key })),
).sort((a, b) => pathMatchPriority(b.path) - pathMatchPriority(a.path));

function pathMatchPriority(pattern: string): number {
  const segments = pattern.split('/');
  const staticCount = segments.filter((s) => !s.startsWith(':')).length;
  return staticCount * 1000 + pattern.length;
}

function normalizePathname(pathname: string): string {
  return pathname.replace(/^\//, '').replace(/\/$/, '');
}

function pathPatternToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/:[^/]+/g, '[^/]+');
  return new RegExp(`^${escaped}$`);
}

export function getAgentRoutePermissionDefinition(
  permission: AgentRoutePermissionKey,
): AgentRoutePermissionDefinition {
  return ROUTE_PERMISSION_BY_KEY[permission];
}

export function canAccessAgentRoute(
  permission: AgentRoutePermissionKey,
  profile: AgentAuthorizedProfile,
): boolean {
  return ROUTE_PERMISSION_BY_KEY[permission].check(profile);
}

export function getAgentRouteForbiddenCopy(
  permission: AgentRoutePermissionKey,
): ForbiddenPageProps {
  const custom = ROUTE_PERMISSION_BY_KEY[permission].forbidden;
  if (custom) return custom;
  return { subtitleKey: 'ag_forbidden_default', backTo: '/' };
}

export function resolveAgentRoutePermission(pathname: string): AgentRoutePermissionKey | null {
  const normalized = normalizePathname(pathname);
  if (!normalized) return null;
  for (const { path, permission } of ROUTE_PATH_ENTRIES) {
    if (pathPatternToRegex(path).test(normalized)) return permission;
  }
  return null;
}

export function canAccessAgentPath(
  pathname: string,
  profile: AgentAuthorizedProfile,
): boolean {
  const permission = resolveAgentRoutePermission(pathname);
  if (!permission) return true;
  return canAccessAgentRoute(permission, profile);
}
