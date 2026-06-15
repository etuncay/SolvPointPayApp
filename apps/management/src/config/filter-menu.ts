import { isAllAccessRole, type BackOfficeRole, type NavItem, type NavSection } from '@epay/ui';
import {
  canSeeBanksMenu,
  getVisibleBanksChildIds,
  type BanksChildId,
} from '@/features/banks/domain/nav-permissions';
import { filterRiskMenuItem } from '@/features/risk-compliance/domain/nav-permissions';
import { filterOpsMenuItem } from '@/features/operational-processes/domain/nav-permissions';
import { filterSystemMenuItem } from '@/features/system/domain/nav-permissions';
import { filterHrMenuItem } from '@/features/hr/domain/nav-permissions';
import { countOpenRiskCases } from '@/mocks/risk-cases';

/** Rol bazlı menü filtresi — banks, risk ve ops grupları */
export function filterMenuForRole(items: NavItem[], role: BackOfficeRole): NavItem[] {
  // Süper-rol (alltest) tüm menü öğelerini olduğu gibi görür.
  if (isAllAccessRole(role)) return items;

  const visibleBankIds = new Set(getVisibleBanksChildIds(role));

  return items.flatMap((item) => {
    if (item.id === 'ops') {
      const filtered = filterOpsMenuItem(item, role);
      return filtered ? [filtered] : [];
    }

    if (item.id === 'reports') {
      if (role === 'ops') return [];
      return [{ ...item, soon: undefined }];
    }

    if (item.id === 'system') {
      const filtered = filterSystemMenuItem(item, role);
      return filtered ? [filtered] : [];
    }

    if (item.id === 'hr') {
      const filtered = filterHrMenuItem(item, role);
      return filtered ? [filtered] : [];
    }

    if (item.id === 'support') {
      const kids = (item.kids ?? []).filter(
        (k) => k.id !== 'supp_reports' || role === 'management',
      );
      return [{ ...item, kids, soon: undefined }];
    }

    if (item.id === 'risk') {
      const filtered = filterRiskMenuItem(item, role);
      if (!filtered) return [];
      return [
        {
          ...filtered,
          badge: countOpenRiskCases(),
          badgeTone: 'danger' as const,
        },
      ];
    }

    if (item.id !== 'banks') return [item];

    if (!canSeeBanksMenu(role)) return [];

    const kids = (item.kids ?? []).filter((k) => visibleBankIds.has(k.id as BanksChildId));
    if (kids.length === 0) return [];

    return [
      {
        ...item,
        soon: undefined,
        href: kids[0]!.href,
        kids,
      },
    ];
  });
}

/** Menüde görünmeyen parent'ları section listesinden çıkar */
export function filterNavSections(
  sections: NavSection[],
  menuById: Record<string, NavItem>,
): NavSection[] {
  return sections
    .map((s) => ({
      ...s,
      itemIds: s.itemIds.filter((id) => menuById[id] != null),
    }))
    .filter((s) => s.itemIds.length > 0);
}
