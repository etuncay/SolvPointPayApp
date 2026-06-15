import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

/** Alt menü sırası — spec §4 */
export const BANKS_CHILD_IDS = [
  'bk_integrated',
  'bk_accounts',
  'bk_movements',
  'bk_recon',
] as const;

export type BanksChildId = (typeof BANKS_CHILD_IDS)[number];

export const BANKS_CHILD_HREFS: Record<BanksChildId, string> = {
  bk_integrated: '/banks/integrated',
  bk_accounts: '/banks/accounts',
  bk_movements: '/banks/movements',
  bk_recon: '/banks/reconciliation',
};

const FINANCE_CHILDREN: BanksChildId[] = [...BANKS_CHILD_IDS];
const OPS_CHILDREN: BanksChildId[] = ['bk_movements', 'bk_recon'];

/** Spec §3 — üst doküman esas: finance/management 6.1–6.4, ops 6.3–6.4 */
export function getVisibleBanksChildIds(role: BackOfficeRole): BanksChildId[] {
  if (isAllAccessRole(role)) return [...BANKS_CHILD_IDS];
  switch (role) {
    case 'finance':
    case 'management':
      return FINANCE_CHILDREN;
    case 'ops':
      return OPS_CHILDREN;
    default:
      return [];
  }
}

export function canSeeBanksMenu(role: BackOfficeRole): boolean {
  return getVisibleBanksChildIds(role).length > 0;
}

export function getDefaultBanksHref(role: BackOfficeRole): string | null {
  const ids = getVisibleBanksChildIds(role);
  if (ids.length === 0) return null;
  return BANKS_CHILD_HREFS[ids[0]!];
}

export const BANKS_PATH_SUB_ID: Record<string, BanksChildId> = {
  '/banks/integrated': 'bk_integrated',
  '/banks/accounts': 'bk_accounts',
  '/banks/movements': 'bk_movements',
  '/banks/reconciliation': 'bk_recon',
};

export const BANKS_SUB_LABEL_KEYS: Record<BanksChildId, string> = {
  bk_integrated: 's_bk_integrated',
  bk_accounts: 's_bk_accounts',
  bk_movements: 's_bk_movements',
  bk_recon: 's_bk_recon',
};
