import { isAllAccessRole, type BackOfficeRole, type NavItem } from '@epay/ui';
import { countOpenFraudCases } from '@/mocks/fraud-cases';

/** Alt menü sırası — spec §4 */
export const RISK_CHILD_IDS = [
  'rk_score',
  'rk_limits',
  'rk_scores',
  'rk_fraud',
  'rk_cases',
  'rk_admin',
] as const;

export type RiskChildId = (typeof RISK_CHILD_IDS)[number];

export const RISK_CHILD_HREFS: Record<RiskChildId, string> = {
  rk_score: '/risk/score-definition',
  rk_limits: '/risk/limits',
  rk_scores: '/risk/scores',
  rk_fraud: '/risk/fraud-rules',
  rk_cases: '/risk/cases',
  rk_admin: '/risk/admin',
};

const COMPLIANCE_CHILDREN: RiskChildId[] = [...RISK_CHILD_IDS];
const MANAGEMENT_CHILDREN: RiskChildId[] = ['rk_limits', 'rk_admin'];

/** Spec §3 — uyum 7.1–7.6; yönetim yalnızca 7.6 */
export function getVisibleRiskChildIds(role: BackOfficeRole): RiskChildId[] {
  if (isAllAccessRole(role)) return [...RISK_CHILD_IDS];
  switch (role) {
    case 'compliance':
      return COMPLIANCE_CHILDREN;
    case 'management':
      return MANAGEMENT_CHILDREN;
    default:
      return [];
  }
}

export function canSeeRiskMenu(role: BackOfficeRole): boolean {
  return role === 'compliance' || role === 'management' || isAllAccessRole(role);
}

export const RISK_PATH_SUB_ID: Record<string, RiskChildId> = {
  '/risk/score-definition': 'rk_score',
  '/risk/limits': 'rk_limits',
  '/risk/scores': 'rk_scores',
  '/risk/fraud-rules': 'rk_fraud',
  '/risk/cases': 'rk_cases',
  '/risk/admin': 'rk_admin',
};

export const RISK_SUB_LABEL_KEYS: Record<RiskChildId, string> = {
  rk_score: 's_rk_score',
  rk_limits: 's_rk_limits',
  rk_scores: 's_rk_scores',
  rk_fraud: 's_rk_fraud',
  rk_cases: 's_rk_cases',
  rk_admin: 's_rk_admin',
};

const SECTION_NO: Record<RiskChildId, string> = {
  rk_score: '7.1',
  rk_limits: '7.2',
  rk_scores: '7.3',
  rk_fraud: '7.4',
  rk_cases: '7.5',
  rk_admin: '7.6',
};

export function getRiskSectionNo(subId: RiskChildId): string {
  return SECTION_NO[subId];
}

/** Menü öğesini role göre filtrele — plan 6 filterBanksMenu deseni */
export function filterRiskMenuItem(item: NavItem, role: BackOfficeRole): NavItem | null {
  if (item.id !== 'risk') return item;
  if (!canSeeRiskMenu(role)) return null;

  const visible = new Set(getVisibleRiskChildIds(role));
  const kids = (item.kids ?? []).filter((k) => visible.has(k.id as RiskChildId));
  if (kids.length === 0) return null;

  return {
    ...item,
    soon: undefined,
    href: '/risk',
    kids: kids.map((k) => {
      const base = { ...k, soon: undefined, href: RISK_CHILD_HREFS[k.id as RiskChildId] };
      if (k.id === 'rk_cases' && role === 'compliance') {
        return { ...base, badge: countOpenFraudCases(), badgeTone: 'danger' as const };
      }
      return base;
    }),
    badge: role === 'compliance' ? countOpenFraudCases() : item.badge,
  };
}
