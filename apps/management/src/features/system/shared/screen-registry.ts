/** BackOffice ekran kataloğu — 12.2 onay kuralları ve 12.3 yetki matrisi kaynağı */

export interface BackofficeScreenDef {
  moduleId: string;
  screenId: string;
  screenKey: string;
  moduleLabelKey: string;
  labelKey: string;
  route?: string;
}

export const BACKOFFICE_SCREENS: BackofficeScreenDef[] = [
  { moduleId: 'customers', screenId: 'customers.list', screenKey: 'customers.list', moduleLabelKey: 'nav_customers', labelKey: 'nav_customers', route: '/customers' },
  { moduleId: 'customers', screenId: 'customers.individual', screenKey: 'customers.individual.form', moduleLabelKey: 'nav_customers', labelKey: 's_cust_new_indv', route: '/customers/new-individual' },
  { moduleId: 'customers', screenId: 'customers.corporate', screenKey: 'customers.corporate.form', moduleLabelKey: 'nav_customers', labelKey: 's_cust_new_corp', route: '/customers/new-corporate' },
  { moduleId: 'customers', screenId: 'customers.fees', screenKey: 'customers.fees', moduleLabelKey: 'nav_customers', labelKey: 's_cust_fees', route: '/customers/fees' },
  { moduleId: 'agents', screenId: 'agents.list', screenKey: 'agents.list', moduleLabelKey: 'nav_agents', labelKey: 'nav_agents', route: '/agents' },
  { moduleId: 'agents', screenId: 'agents.form', screenKey: 'agents.form', moduleLabelKey: 'nav_agents', labelKey: 's_ag_new', route: '/agents/new' },
  { moduleId: 'agents', screenId: 'agents.authorized', screenKey: 'agents.authorized', moduleLabelKey: 'nav_agents', labelKey: 'ap_form_authorized_person', route: '/agents/authorized-persons/:personId' },
  { moduleId: 'agents', screenId: 'agents.fees', screenKey: 'agents.fees', moduleLabelKey: 'nav_agents', labelKey: 's_cust_fees', route: '/agents/fees' },
  { moduleId: 'wallets', screenId: 'wallets.list', screenKey: 'wallets.list', moduleLabelKey: 'nav_wallets', labelKey: 'nav_wallets', route: '/wallets' },
  { moduleId: 'wallets', screenId: 'wallets.detail', screenKey: 'wallets.detail', moduleLabelKey: 'nav_wallets', labelKey: 'wd_detail', route: '/wallets/:id' },
  { moduleId: 'transfers', screenId: 'transfers.list', screenKey: 'transfers.list', moduleLabelKey: 'nav_transfers', labelKey: 'nav_transfers', route: '/transfers' },
  { moduleId: 'transfers', screenId: 'transfers.manual', screenKey: 'transfers.manual', moduleLabelKey: 'nav_transfers', labelKey: 's_tr_refund', route: '/transfers/manual' },
  { moduleId: 'banks', screenId: 'banks.reconciliation', screenKey: 'banks.reconciliation', moduleLabelKey: 'm_banks', labelKey: 's_bk_recon', route: '/banks/reconciliation' },
  { moduleId: 'risk', screenId: 'risk.scores', screenKey: 'risk.scores', moduleLabelKey: 'm_risk', labelKey: 's_rk_scores', route: '/risk/scores' },
  { moduleId: 'risk', screenId: 'risk.limits', screenKey: 'risk.limits', moduleLabelKey: 'm_risk', labelKey: 's_rk_limits', route: '/risk/limits' },
  { moduleId: 'risk', screenId: 'risk.admin', screenKey: 'risk.admin', moduleLabelKey: 'm_risk', labelKey: 's_rk_admin', route: '/risk/admin' },
  { moduleId: 'ops', screenId: 'approvals.pool', screenKey: 'approvals.pool', moduleLabelKey: 'm_ops', labelKey: 's_op_approval', route: '/approvals' },
  { moduleId: 'ops', screenId: 'ops.kyc', screenKey: 'ops.kyc', moduleLabelKey: 'm_ops', labelKey: 'nav_kyc', route: '/ops/kyc' },
  { moduleId: 'dms', screenId: 'documents.list', screenKey: 'documents.list', moduleLabelKey: 'm_dms', labelKey: 'm_dms', route: '/documents' },
  { moduleId: 'support', screenId: 'support.cases', screenKey: 'support.cases', moduleLabelKey: 'm_support', labelKey: 'm_support', route: '/support/cases' },
  { moduleId: 'system', screenId: 'system.users', screenKey: 'system.users', moduleLabelKey: 'm_system', labelKey: 's_sys_users', route: '/system/users' },
  { moduleId: 'system', screenId: 'system.approval_rules', screenKey: 'system.approval_rules', moduleLabelKey: 'm_system', labelKey: 's_sys_approval_rules', route: '/system/approval-rules' },
  { moduleId: 'system', screenId: 'system.roles', screenKey: 'system.roles', moduleLabelKey: 'm_system', labelKey: 's_sys_roles', route: '/system/roles' },
  { moduleId: 'system', screenId: 'system.parameters', screenKey: 'system.parameters', moduleLabelKey: 'm_system', labelKey: 'rm_panel_params', route: '/system/parameters' },
  { moduleId: 'system', screenId: 'system.jobs', screenKey: 'system.jobs', moduleLabelKey: 'm_system', labelKey: 's_sys_scheduled', route: '/system/jobs' },
  { moduleId: 'system', screenId: 'system.notifications', screenKey: 'system.notifications', moduleLabelKey: 'm_system', labelKey: 's_sys_notifications', route: '/system/notifications' },
  { moduleId: 'system', screenId: 'system.integrations', screenKey: 'system.integrations', moduleLabelKey: 'm_system', labelKey: 's_sys_integrations', route: '/system/integrations' },
];

export function getScreenById(screenId: string): BackofficeScreenDef | undefined {
  return BACKOFFICE_SCREENS.find((s) => s.screenId === screenId);
}

export function getScreenByKey(screenKey: string): BackofficeScreenDef | undefined {
  return BACKOFFICE_SCREENS.find((s) => s.screenKey === screenKey);
}
