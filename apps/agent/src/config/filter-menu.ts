import type { BackOfficeRole, NavItem, NavSection } from '@epay/ui';

/** Agent portalında menü daraltılmış — rol filtresi uygulanmaz */
export function filterMenuForRole(items: NavItem[], _role: BackOfficeRole): NavItem[] {
  return items;
}

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
