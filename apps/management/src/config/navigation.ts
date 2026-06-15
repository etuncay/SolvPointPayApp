import type { NavItem, NavSection } from '@epay/ui';
import { BANKS_CHILD_HREFS } from '@/features/banks/domain/nav-permissions';
import { RISK_CHILD_HREFS } from '@/features/risk-compliance/domain/nav-permissions';
import { TRANSFER_MENU_DETAIL_HREF } from './transfer-menu-demo';
import { WALLET_MENU_ACTIVITIES_HREF, WALLET_MENU_DETAIL_HREF } from './wallet-menu-demo';

export const NAV_SECTIONS: NavSection[] = [
  { title: 'nav_overview', itemIds: ['home'] },
  { title: 'nav_ops', itemIds: ['customers', 'agents', 'wallets', 'transfers', 'banks'] },
  { title: 'nav_compliance', itemIds: ['risk', 'ops'] },
  { title: 'nav_admin', itemIds: ['dms', 'support', 'reports', 'system', 'hr', 'playground'] },
];

export const MENU_ITEMS: NavItem[] = [
  { id: 'home', icon: 'home', label: 'page_title', href: '/' },
  {
    id: 'customers',
    icon: 'user',
    label: 'nav_customers',
    href: '/customers',
    kids: [
      { id: 'cust_list', no: '2', label: 's_cust_list', href: '/customers' },
      { id: 'cust_new_indv', no: '2.1', label: 's_cust_new_indv', href: '/customers/new-individual' },
      { id: 'cust_new_corp', no: '2.2', label: 's_cust_new_corp', href: '/customers/new-corporate' },
      { id: 'cust_notes', no: '2.3', label: 's_cust_notes', href: '/customers/notes' },
      { id: 'cust_doc', no: '2.4', label: 's_cust_doc', href: '/customers/documents/review' },
      { id: 'cust_fees', no: '2.5', label: 's_cust_fees', href: '/customers/fees' },
      { id: 'cust_campaign', no: '2.6', label: 's_cust_campaign', href: '/customers/campaigns' },
    ],
  },
  {
    id: 'agents',
    icon: 'building',
    label: 'nav_agents',
    href: '/agents',
    kids: [
      { id: 'ag_list', no: '3', label: 's_ag_list', href: '/agents' },
      { id: 'ag_new', no: '3.1', label: 's_ag_new', href: '/agents/new' },
      { id: 'ag_authperson', no: '3.2', label: 's_ag_authperson', href: '/agents/authorized-persons/new' },
      { id: 'ag_group', no: '3.3', label: 's_ag_group', href: '/agents/groups' },
      { id: 'ag_fees', no: '3.4', label: 's_cust_fees', href: '/agents/fees' },
    ],
  },
  {
    id: 'wallets',
    icon: 'wallet',
    label: 'nav_wallets',
    href: '/wallets',
    kids: [
      { id: 'wl_detail', no: '4.1', label: 's_wl_detail', href: WALLET_MENU_DETAIL_HREF },
      { id: 'wl_activity', no: '4.2', label: 's_wl_activity', href: WALLET_MENU_ACTIVITIES_HREF },
    ],
  },
  {
    id: 'transfers',
    icon: 'transfer',
    label: 'nav_transfers',
    href: '/transfers',
    kids: [
      { id: 'tr_detail', no: '5.1', label: 's_tr_detail', href: TRANSFER_MENU_DETAIL_HREF },
      { id: 'tr_refund', no: '5.2', label: 's_tr_refund', href: '/transfers/manual' },
    ],
  },
  {
    id: 'banks',
    icon: 'bank',
    label: 'm_banks',
    href: BANKS_CHILD_HREFS.bk_integrated,
    kids: [
      { id: 'bk_integrated', no: '6.1', label: 's_bk_integrated', href: BANKS_CHILD_HREFS.bk_integrated },
      { id: 'bk_accounts', no: '6.2', label: 's_bk_accounts', href: BANKS_CHILD_HREFS.bk_accounts },
      { id: 'bk_movements', no: '6.3', label: 's_bk_movements', href: BANKS_CHILD_HREFS.bk_movements },
      { id: 'bk_recon', no: '6.4', label: 's_bk_recon', href: BANKS_CHILD_HREFS.bk_recon },
    ],
  },
  {
    id: 'risk',
    icon: 'shield',
    label: 'm_risk',
    href: '/risk',
    badge: 9,
    badgeTone: 'danger',
    kids: [
      { id: 'rk_score', no: '7.1', label: 's_rk_score', href: RISK_CHILD_HREFS.rk_score },
      { id: 'rk_limits', no: '7.2', label: 's_rk_limits', href: RISK_CHILD_HREFS.rk_limits },
      { id: 'rk_scores', no: '7.3', label: 's_rk_scores', href: RISK_CHILD_HREFS.rk_scores },
      { id: 'rk_fraud', no: '7.4', label: 's_rk_fraud', href: RISK_CHILD_HREFS.rk_fraud },
      { id: 'rk_cases', no: '7.5', label: 's_rk_cases', href: RISK_CHILD_HREFS.rk_cases },
      { id: 'rk_admin', no: '7.6', label: 's_rk_admin', href: RISK_CHILD_HREFS.rk_admin },
    ],
  },
  {
    id: 'ops',
    icon: 'process',
    label: 'm_ops',
    href: '/approvals',
    kids: [
      { id: 'op_approval', no: '8.1', label: 's_op_approval', href: '/approvals' },
      { id: 'op_kyc', no: '8.2', label: 'nav_kyc', href: '/ops/kyc' },
      { id: 'op_accounting', no: '8.3', label: 's_op_accounting', href: '/ops/accounting' },
      { id: 'op_btrans', no: '8.4', label: 's_op_btrans', href: '/ops/btrans' },
      { id: 'op_recon', no: '8.5', label: 's_op_recon', href: '/ops/reconciliation' },
      { id: 'op_fx', no: '8.6', label: 's_op_fx', href: '/ops/fx' },
    ],
  },
  {
    id: 'dms',
    icon: 'doc',
    label: 'm_dms',
    href: '/documents',
    kids: [
      { id: 'dms_new', no: '9.1', label: 's_dms_new', href: '/documents/new' },
      { id: 'dms_types', no: '9.3', label: 's_dms_types', href: '/documents/types' },
    ],
  },
  {
    id: 'support',
    icon: 'support',
    label: 'm_support',
    href: '/support/cases',
    kids: [
      { id: 'supp_new', no: '10.1', label: 's_supp_new', href: '/support/cases/new' },
      { id: 'supp_reports', no: '10.2', label: 's_supp_reports', href: '/support/reports' },
    ],
  },
  { id: 'reports', icon: 'chart', label: 'nav_reports', href: '/reports' },
  {
    id: 'system',
    icon: 'settings',
    label: 'm_system',
    href: '/system/users',
    kids: [
      { id: 'sys_users', no: '12.1', label: 's_sys_users', href: '/system/users' },
      { id: 'sys_approval_rules', no: '12.2', label: 's_sys_approval_rules', href: '/system/approval-rules' },
      { id: 'sys_roles', no: '12.3', label: 's_sys_roles', href: '/system/roles' },
      { id: 'sys_params', no: '12.4', label: 'rm_panel_params', href: '/system/parameters' },
      { id: 'sys_scheduled', no: '12.5', label: 's_sys_scheduled', href: '/system/jobs' },
      { id: 'sys_notifications', no: '12.6', label: 's_sys_notifications', href: '/system/notifications' },
      { id: 'sys_integrations', no: '12.7', label: 's_sys_integrations', href: '/system/integrations' },
    ],
  },
  {
    id: 'hr',
    icon: 'hr',
    label: 'm_hr',
    href: '/hr/employees',
    kids: [
      { id: 'hr_employees', no: '13', label: 's_hr_employees', href: '/hr/employees' },
      { id: 'hr_employee_new', no: '13.1', label: 's_hr_new_employee', href: '/hr/employees/new' },
      { id: 'hr_leave', no: '13.2', label: 's_hr_leave', href: '/hr/leave' },
      { id: 'hr_leave_new', no: '13.3', label: 's_hr_leave_new', href: '/hr/leave/new' },
    ],
  },
  {
    id: 'playground',
    icon: 'code',
    label: 'm_playground',
    href: '/playground',
  },
];

export const MENU_BY_ID = Object.fromEntries(MENU_ITEMS.map((m) => [m.id, m])) as Record<
  string,
  NavItem
>;

export const BREADCRUMB_MAP: Record<string, { section: string; label: string }> = {
  home: { section: 'nav_overview', label: 'page_title' },
  customers: { section: 'nav_ops', label: 'nav_customers' },
  agents: { section: 'nav_ops', label: 'nav_agents' },
  wallets: { section: 'nav_ops', label: 'nav_wallets' },
  transfers: { section: 'nav_ops', label: 'nav_transfers' },
  banks: { section: 'nav_ops', label: 'm_banks' },
  risk: { section: 'nav_compliance', label: 'm_risk' },
  ops: { section: 'nav_compliance', label: 'm_ops' },
  dms: { section: 'nav_admin', label: 'm_dms' },
  support: { section: 'nav_admin', label: 'm_support' },
  supp_new: { section: 'nav_admin', label: 's_supp_new' },
  supp_reports: { section: 'nav_admin', label: 's_supp_reports' },
  reports: { section: 'nav_admin', label: 'nav_reports' },
  system: { section: 'nav_admin', label: 'm_system' },
  hr: { section: 'nav_admin', label: 'm_hr' },
  playground: { section: 'nav_admin', label: 'm_playground' },
};
