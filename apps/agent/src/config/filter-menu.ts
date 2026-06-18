import type { NavItem, NavSection } from '@epay/ui';
import type { AgentPermissions } from '@/domain/permissions';

function withoutDevPlayground(items: NavItem[]): NavItem[] {
  if (import.meta.env.DEV) return items;
  return items.filter((item) => item.id !== 'playground');
}

function filterKids(item: NavItem, permissions: AgentPermissions): NavItem | null {
  if (!item.kids?.length) return item;

  const kids = item.kids.filter((kid) => {
    if (kid.id === 'cust_new') return permissions.customers.create;
    return true;
  });

  if (kids.length === 0) return null;
  return { ...item, kids };
}

/** Temsilci yetkilerine göre menü — yetkisiz modüller gizlenir. */
export function filterMenuForAgent(items: NavItem[], permissions: AgentPermissions): NavItem[] {
  const baseItems = withoutDevPlayground(items);

  return baseItems.flatMap((item) => {
    switch (item.id) {
      case 'withdrawal':
        return permissions.withdrawal.access ? [item] : [];
      case 'transfers':
        return permissions.transfers.access ? [item] : [];
      case 'playground':
        return permissions.playground.access ? [item] : [];
      case 'customers': {
        if (!permissions.customers.list) return [];
        const filtered = filterKids(item, permissions);
        return filtered ? [filtered] : [];
      }
      default:
        return [item];
    }
  });
}

/** @deprecated useAgentSession + filterMenuForAgent */
export function filterMenuForRole(items: NavItem[], permissions: AgentPermissions): NavItem[] {
  return filterMenuForAgent(items, permissions);
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
