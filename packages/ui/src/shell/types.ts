export type NavChild = {
  id: string;
  no: string;
  label: string;
  href?: string;
  soon?: boolean;
  badge?: number;
};

export type NavItem = {
  id: string;
  icon: string;
  label: string;
  href?: string;
  soon?: boolean;
  badge?: number;
  badgeTone?: 'danger';
  kids?: NavChild[];
};

export type NavSection = {
  title: string;
  itemIds: string[];
};

export type BackOfficeRole = 'ops' | 'finance' | 'compliance' | 'management' | 'alltest';

/** Tüm ekranları gören test/süper rol kodu — RBAC'te tam erişim verilir. */
export const ALL_ACCESS_ROLE: BackOfficeRole = 'alltest';

/** Süper-rol mü? Nav filtresi ve route guard'larında tam erişim için kullanılır. */
export function isAllAccessRole(role: BackOfficeRole): boolean {
  return role === ALL_ACCESS_ROLE;
}
