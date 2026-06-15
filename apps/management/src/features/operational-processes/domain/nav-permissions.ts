import { isAllAccessRole, type BackOfficeRole, type NavItem } from '@epay/ui';
import { countOpenKycReviews } from '@/features/kyc-management/api/mock-kyc-reviews-adapter';

/** Alt menü sırası — spec §4 */
export const OPS_CHILD_IDS = [
  'op_approval',
  'op_kyc',
  'op_accounting',
  'op_btrans',
  'op_recon',
  'op_fx',
] as const;

export type OpsChildId = (typeof OPS_CHILD_IDS)[number];

export const OPS_CHILD_HREFS: Record<OpsChildId, string> = {
  op_approval: '/approvals',
  op_kyc: '/ops/kyc',
  op_accounting: '/ops/accounting',
  op_btrans: '/ops/btrans',
  op_recon: '/ops/reconciliation',
  op_fx: '/ops/fx',
};

const FINANCE_CHILDREN: OpsChildId[] = ['op_accounting', 'op_btrans', 'op_recon', 'op_fx'];

/** Spec §3 — plan 8 menü matrisi */
export function getVisibleOpsChildIds(role: BackOfficeRole): OpsChildId[] {
  if (isAllAccessRole(role)) return [...OPS_CHILD_IDS];
  switch (role) {
    case 'ops':
      return ['op_approval'];
    case 'compliance':
      return ['op_kyc'];
    case 'finance':
    case 'management':
      return [...FINANCE_CHILDREN];
    default:
      return [];
  }
}

export function canSeeOpsMenu(role: BackOfficeRole): boolean {
  return getVisibleOpsChildIds(role).length > 0;
}

export function getOpsMenuDefaultHref(role: BackOfficeRole): string | null {
  const ids = getVisibleOpsChildIds(role);
  if (ids.length === 0) return null;
  return OPS_CHILD_HREFS[ids[0]!];
}

export const OPS_PATH_SUB_ID: Record<string, OpsChildId> = {
  '/approvals': 'op_approval',
  '/ops/kyc': 'op_kyc',
  '/ops/accounting': 'op_accounting',
  '/ops/btrans': 'op_btrans',
  '/ops/reconciliation': 'op_recon',
  '/ops/fx': 'op_fx',
};

export const OPS_SUB_LABEL_KEYS: Record<OpsChildId, string> = {
  op_approval: 's_op_approval',
  op_kyc: 'nav_kyc',
  op_accounting: 's_op_accounting',
  op_btrans: 's_op_btrans',
  op_recon: 's_op_recon',
  op_fx: 's_op_fx',
};

const SECTION_NO: Record<OpsChildId, string> = {
  op_approval: '8.1',
  op_kyc: '8.2',
  op_accounting: '8.3',
  op_btrans: '8.4',
  op_recon: '8.5',
  op_fx: '8.6',
};

export function getOpsSectionNo(subId: OpsChildId): string {
  return SECTION_NO[subId];
}

/** Menü öğesini role göre filtrele — plan 6 banks deseni */
export function filterOpsMenuItem(item: NavItem, role: BackOfficeRole): NavItem | null {
  if (item.id !== 'ops') return item;
  if (!canSeeOpsMenu(role)) return null;

  const visible = new Set(getVisibleOpsChildIds(role));
  const kids = (item.kids ?? [])
    .filter((k) => visible.has(k.id as OpsChildId))
    .map((k) => {
      const base = { ...k, soon: undefined, href: OPS_CHILD_HREFS[k.id as OpsChildId] ?? k.href };
      if (k.id === 'op_kyc') {
        return { ...base, badge: countOpenKycReviews(), badgeTone: 'danger' as const };
      }
      return base;
    });
  if (kids.length === 0) return null;

  return {
    ...item,
    soon: undefined,
    href: kids[0]!.href,
    kids,
  };
}
