import type { BackOfficeRole } from '@epay/ui';
import type { ForbiddenPageProps } from '@/pages/forbidden-page';
import { getAgentFeePermissions } from '@/features/agent-fees/domain/permissions';
import { getAgentFormPermissions } from '@/features/agent-form/domain/permissions';
import { getAgentGroupPermissions } from '@/features/agent-groups/domain/permissions';
import { getAgentPermissions } from '@/features/agents/domain/permissions';
import { getAuthorizedPersonPermissions } from '@/features/authorized-person-form/domain/permissions';
import { getApprovalPoolPermissions } from '@/features/approval-pool/domain/permissions';
import { getCompanyBankAccountPermissions } from '@/features/banks/company-accounts/domain/permissions';
import { getIntegratedBankPermissions } from '@/features/banks/integrated/domain/permissions';
import { getBankMovementPermissions } from '@/features/banks/movements/domain/permissions';
import { getBankReconciliationPermissions } from '@/features/banks/reconciliation/domain/permissions';
import { getCorporateCustomerPermissions } from '@/features/corporate-form/domain/permissions';
import { getCustomerPermissions } from '@/features/customers/domain/permissions';
import { getIndividualCustomerPermissions } from '@/features/individual-form/domain/permissions';
import { getCorrectionPermissions } from '@/features/transfers/domain/correction-permissions';
import { getTransactionDetailPermissions } from '@/features/transfers/domain/detail-permissions';
import { getTransactionPermissions } from '@/features/transfers/domain/permissions';
import { getWalletActivityPermissions } from '@/features/wallets/domain/activity-permissions';
import { getWalletDetailPermissions } from '@/features/wallets/domain/detail-permissions';
import { getWalletPermissions } from '@/features/wallets/domain/permissions';

export type RoutePermissionChecker = (role: BackOfficeRole) => boolean;

export interface RoutePermissionDefinition {
  /** Modül izin fonksiyonu ile hizalı anahtar */
  key: RoutePermissionKey;
  /** React Router child path (göreli, `/` öneki yok) */
  paths: readonly string[];
  check: RoutePermissionChecker;
  forbidden?: ForbiddenPageProps;
}

/** Route seviyesi izin anahtarları — modül `permissions.ts` ile hizalı. */
export type RoutePermissionKey =
  | 'wallets.list'
  | 'wallets.detail'
  | 'wallets.activities'
  | 'transfers.list'
  | 'transfers.detail'
  | 'transfers.manual'
  | 'approvals.list'
  | 'approvals.detail'
  | 'customers.list'
  | 'customers.individual.new'
  | 'customers.individual.edit'
  | 'customers.corporate.new'
  | 'customers.corporate.edit'
  | 'agents.list'
  | 'agents.form.new'
  | 'agents.form.edit'
  | 'agents.groups'
  | 'agents.groups.assignments'
  | 'agents.fees'
  | 'agents.authorized-person'
  | 'banks.integrated'
  | 'banks.accounts'
  | 'banks.movements'
  | 'banks.reconciliation';

/**
 * Merkezi route izin haritası — path, checker ve ForbiddenPage metinleri tek kaynak.
 * Yeni guarded route eklerken yalnızca bu diziye kayıt ekleyin.
 */
export const ROUTE_PERMISSIONS: readonly RoutePermissionDefinition[] = [
  {
    key: 'customers.list',
    paths: ['customers'],
    check: (role) => getCustomerPermissions(role).list,
  },
  {
    key: 'customers.individual.new',
    paths: ['customers/new-individual'],
    check: (role) => getIndividualCustomerPermissions(role).insert,
  },
  {
    key: 'customers.individual.edit',
    paths: ['customers/:customerId/individual'],
    check: (role) => {
      const p = getIndividualCustomerPermissions(role);
      return p.update || p.view;
    },
  },
  {
    key: 'customers.corporate.new',
    paths: ['customers/new-corporate'],
    check: (role) => getCorporateCustomerPermissions(role).insert,
  },
  {
    key: 'customers.corporate.edit',
    paths: ['customers/:customerId/corporate'],
    check: (role) => {
      const p = getCorporateCustomerPermissions(role);
      return p.update || p.view;
    },
  },
  {
    key: 'agents.list',
    paths: ['agents'],
    check: (role) => getAgentPermissions(role).list,
  },
  {
    key: 'agents.form.new',
    paths: ['agents/new'],
    check: (role) => getAgentFormPermissions(role).insert,
  },
  {
    key: 'agents.groups',
    paths: ['agents/groups'],
    check: (role) => getAgentGroupPermissions(role).list,
  },
  {
    key: 'agents.groups.assignments',
    paths: ['agents/groups/:groupCode/agents'],
    check: (role) => getAgentGroupPermissions(role).list,
  },
  {
    key: 'agents.fees',
    paths: ['agents/fees'],
    check: (role) => getAgentFeePermissions(role).list,
  },
  {
    key: 'agents.authorized-person',
    paths: ['agents/authorized-persons/new', 'agents/authorized-persons/:personId'],
    check: (role) => {
      const p = getAuthorizedPersonPermissions(role);
      return p.insert || p.update || p.view;
    },
  },
  {
    key: 'agents.form.edit',
    paths: ['agents/:agentId'],
    check: (role) => {
      const p = getAgentFormPermissions(role);
      return p.update || p.view;
    },
  },
  {
    key: 'wallets.list',
    paths: ['wallets'],
    check: (role) => getWalletPermissions(role).list,
  },
  {
    key: 'wallets.detail',
    paths: ['wallets/:walletId'],
    check: (role) => getWalletDetailPermissions(role).view,
  },
  {
    key: 'wallets.activities',
    paths: ['wallets/:walletId/activities'],
    check: (role) => getWalletActivityPermissions(role).list,
  },
  {
    key: 'transfers.list',
    paths: ['transfers'],
    check: (role) => getTransactionPermissions(role).list,
  },
  {
    key: 'transfers.manual',
    paths: ['transfers/manual'],
    check: (role) => getCorrectionPermissions(role).view,
    forbidden: {
      subtitleKey: 'cr_forbidden_sub',
      backTo: '/transfers',
      backLabelKey: 'cr_back_transfers',
    },
  },
  {
    key: 'transfers.detail',
    paths: ['transfers/:transactionId'],
    check: (role) => getTransactionDetailPermissions(role).view,
  },
  {
    key: 'banks.integrated',
    paths: ['banks/integrated'],
    check: (role) => getIntegratedBankPermissions(role).list,
  },
  {
    key: 'banks.accounts',
    paths: ['banks/accounts'],
    check: (role) => getCompanyBankAccountPermissions(role).list,
  },
  {
    key: 'banks.movements',
    paths: ['banks/movements'],
    check: (role) => getBankMovementPermissions(role).list,
  },
  {
    key: 'banks.reconciliation',
    paths: ['banks/reconciliation'],
    check: (role) => getBankReconciliationPermissions(role).list,
  },
  {
    key: 'approvals.list',
    paths: ['approvals'],
    check: (role) => getApprovalPoolPermissions(role).list,
    forbidden: { subtitleKey: 'ap_no_access', backTo: '/' },
  },
  {
    key: 'approvals.detail',
    paths: ['approvals/:approvalId'],
    check: (role) => getApprovalPoolPermissions(role).view,
    forbidden: { subtitleKey: 'ap_no_access', backTo: '/' },
  },
] as const;

const ROUTE_PERMISSION_BY_KEY = Object.fromEntries(
  ROUTE_PERMISSIONS.map((def) => [def.key, def]),
) as Record<RoutePermissionKey, RoutePermissionDefinition>;

/** Path eşleşmesi — statik segmentler dinamik `:param` öncesi, sonra uzunluk. */
const ROUTE_PATH_ENTRIES = ROUTE_PERMISSIONS.flatMap((def) =>
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

export function getRoutePermissionDefinition(
  permission: RoutePermissionKey,
): RoutePermissionDefinition {
  return ROUTE_PERMISSION_BY_KEY[permission];
}

export function canAccessRoute(permission: RoutePermissionKey, role: BackOfficeRole): boolean {
  return ROUTE_PERMISSION_BY_KEY[permission].check(role);
}

export function getRouteForbiddenCopy(permission: RoutePermissionKey): ForbiddenPageProps {
  const custom = ROUTE_PERMISSION_BY_KEY[permission].forbidden;
  if (custom) return custom;
  return { subtitleKey: 'rm_forbidden', backTo: '/' };
}

/** `/transfers/manual` gibi pathname → izin anahtarı (guarded route yoksa null). */
export function resolveRoutePermission(pathname: string): RoutePermissionKey | null {
  const normalized = normalizePathname(pathname);
  if (!normalized) return null;
  for (const { path, permission } of ROUTE_PATH_ENTRIES) {
    if (pathPatternToRegex(path).test(normalized)) return permission;
  }
  return null;
}

export function canAccessPath(pathname: string, role: BackOfficeRole): boolean {
  const permission = resolveRoutePermission(pathname);
  if (!permission) return true;
  return canAccessRoute(permission, role);
}
