import type { NavItem, NavSection } from '@epay/ui';
import { AGENT_PATHS } from './agent-nav-paths';

export const NAV_SECTIONS: NavSection[] = [
  { title: 'nav_overview', itemIds: ['home'] },
  {
    title: 'nav_agent_ops',
    itemIds: ['accounts', 'customers', 'withdrawal', 'transfers', 'transactions'],
  },
  { title: 'nav_agent_support', itemIds: ['feedback'] },
  { title: 'nav_dev', itemIds: ['playground'] },
];

export const MENU_ITEMS: NavItem[] = [
  { id: 'home', icon: 'home', label: 'page_title', href: AGENT_PATHS.home },
  { id: 'accounts', icon: 'wallet', label: 'ag_nav_accounts', href: AGENT_PATHS.accounts },
  {
    id: 'customers',
    icon: 'user',
    label: 'ag_nav_customers',
    // href yok — parent menü, linksiz
    kids: [
      { id: 'cust_list', no: '2.1', label: 'ag_s_cust_list', href: AGENT_PATHS.customers },
      { id: 'cust_new', no: '2.2', label: 'ag_s_cust_new', href: AGENT_PATHS.customerNew },
    ],
  },
  {
    id: 'withdrawal',
    icon: 'transfer',
    label: 'ag_nav_withdrawal',
    href: AGENT_PATHS.withdrawal,
  },
  {
    id: 'transfers',
    icon: 'transfer',
    label: 'ag_nav_transfers',
    href: AGENT_PATHS.transfers.ownWallet,
    kids: [
      { id: 'tr_own', no: '6.1', label: 'ag_s_tr_own', href: AGENT_PATHS.transfers.ownWallet },
      { id: 'tr_bank', no: '6.2', label: 'ag_s_tr_bank', href: AGENT_PATHS.transfers.bankAccount },
      { id: 'tr_person', no: '6.3', label: 'ag_s_tr_person', href: AGENT_PATHS.transfers.person },
      { id: 'tr_abroad', no: '6.4', label: 'ag_s_tr_abroad', href: AGENT_PATHS.transfers.abroad },
    ],
  },
  {
    id: 'transactions',
    icon: 'chart',
    label: 'ag_nav_transactions',
    href: AGENT_PATHS.transactions,
  },
  {
    id: 'feedback',
    icon: 'support',
    label: 'ag_nav_feedback',
    href: AGENT_PATHS.feedback,
  },
  {
    id: 'playground',
    icon: 'code',
    label: 'm_playground',
    href: AGENT_PATHS.playground,
  },
];

export const MENU_BY_ID = Object.fromEntries(MENU_ITEMS.map((m) => [m.id, m])) as Record<
  string,
  NavItem
>;

export const BREADCRUMB_MAP: Record<string, { section: string; label: string }> = {
  home: { section: 'nav_overview', label: 'page_title' },
  accounts: { section: 'nav_agent_ops', label: 'ag_nav_accounts' },
  customers: { section: 'nav_agent_ops', label: 'ag_nav_customers' },
  withdrawal: { section: 'nav_agent_ops', label: 'ag_nav_withdrawal' },
  transfers: { section: 'nav_agent_ops', label: 'ag_nav_transfers' },
  transactions: { section: 'nav_agent_ops', label: 'ag_nav_transactions' },
  feedback: { section: 'nav_agent_support', label: 'ag_nav_feedback' },
  playground: { section: 'nav_dev', label: 'm_playground' },
};

/** Aktif menü öğesinin varsayılan href'i (breadcrumb geri linki) */
export const NAV_DEFAULT_HREF: Record<string, string> = {
  home: AGENT_PATHS.home,
  accounts: AGENT_PATHS.accounts,
  customers: AGENT_PATHS.customers,
  withdrawal: AGENT_PATHS.withdrawal,
  transfers: AGENT_PATHS.transfers.ownWallet,
  transactions: AGENT_PATHS.transactions,
  feedback: AGENT_PATHS.feedback,
  playground: AGENT_PATHS.playground,
};
