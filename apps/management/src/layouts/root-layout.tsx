import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppShell,
  Breadcrumb,
  isAllAccessRole,
  type AppLanguage,
  ThemeProvider,
  useThemeSettings,
  type NavItem,
  type NavSection,
} from '@epay/ui';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Shield,
  ThumbsUp,
} from 'lucide-react';
import { BREADCRUMB_MAP, MENU_ITEMS, NAV_SECTIONS } from '@/config/navigation';
import { filterMenuForRole, filterNavSections } from '@/config/filter-menu';
import { BANKS_PATH_SUB_ID, BANKS_SUB_LABEL_KEYS } from '@/features/banks/domain/nav-permissions';
import { RISK_PATH_SUB_ID, RISK_SUB_LABEL_KEYS } from '@/features/risk-compliance/domain/nav-permissions';
import {
  OPS_PATH_SUB_ID,
  OPS_SUB_LABEL_KEYS,
  getOpsMenuDefaultHref,
} from '@/features/operational-processes/domain/nav-permissions';
import {
  getSystemMenuDefaultHref,
  resolveSystemActiveSub,
} from '@/features/system/domain/nav-permissions';
import { resolveHrActiveSub } from '@/features/hr/domain/nav-permissions';
import { employeeDetailService } from '@/features/hr/employee-form';
import { getLeaveById } from '@/mocks/employee-leaves';
import { kycReviewsService } from '@/features/kyc-management/api';
import { fraudRulesService } from '@/features/risk-compliance/fraud-rules/api';
import { fraudCasesService } from '@/features/risk-compliance/cases/api';
import { useRole } from '@/domain/role-context';
import { useAuth } from '@/domain/auth-context';
import { useNavigationRole } from '@/hooks/use-navigation-role';
import { RoleUrlSync } from '@/components/role-url-sync';
import { AlltestRoleBadge } from '@/components/alltest-role-badge';
import { DemoModeBanner } from '@/components/demo-mode-banner';
import { SettingsProvider, type SettingsTab } from '@/domain/settings-context';
import { UserPreferencesProvider } from '@/domain/user-preferences';
import { NOTIFS } from '@/mocks/data';
import { agentsService } from '@/features/agents/api';
import { agentGroupsService } from '@/features/agent-groups/api';
import { authorizedPersonService } from '@/features/authorized-person-form/api';
import { walletsService } from '@/features/wallets/api';
import { transactionsService } from '@/features/transfers/api';
import { documentsService } from '@/features/dms/api/mock-documents-adapter';
import { documentTypesService } from '@/features/dms/document-types/api/mock-document-types-adapter';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { supportCasesService } from '@/features/support/api/mock-support-cases-adapter';
import { rolesService } from '@/features/system/roles';
import { scheduledJobsService } from '@/features/system/scheduled-jobs';
import { integrationsService } from '@/features/system/integrations';
import { notificationTemplatesService } from '@/features/system/notifications';
import { usersService } from '@/features/system/users';
import { SettingsDrawer } from '@/components/settings-drawer';
import { I18nThemeSync } from '@/providers/i18n-theme-sync';

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  shield: <Shield size={14} />,
  approve: <ThumbsUp size={14} />,
  warning: <AlertTriangle size={14} />,
  check: <CheckCircle size={14} />,
  info: <Info size={14} />,
};

function LayoutInner() {
  const { t } = useTranslation();
  const { role, accountRole, isDemoRoleOverride, cycleRole } = useRole();
  const { navigationRole } = useNavigationRole();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, lang, setLang } = useThemeSettings();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('app');

  const openSettings = (tab: SettingsTab = 'app') => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  };

  const activeNav =
    location.pathname === '/'
      ? 'home'
      : location.pathname.startsWith('/customers')
        ? 'customers'
        : location.pathname.startsWith('/agents')
          ? 'agents'
          : location.pathname.startsWith('/wallets')
            ? 'wallets'
            : location.pathname.startsWith('/transfers')
              ? 'transfers'
              : location.pathname.startsWith('/banks')
                ? 'banks'
                : location.pathname.startsWith('/risk')
                  ? 'risk'
                  : location.pathname.startsWith('/approvals') ||
                      location.pathname.startsWith('/ops')
                    ? 'ops'
                    : location.pathname.startsWith('/documents')
                      ? 'dms'
                      : location.pathname.startsWith('/system')
                        ? 'system'
                        : location.pathname.startsWith('/hr')
                          ? 'hr'
                          : location.pathname.startsWith('/playground')
                            ? 'playground'
                            : 'home';

  const systemActiveSub = resolveSystemActiveSub(location.pathname);
  const hrActiveSub = resolveHrActiveSub(location.pathname);

  const activeSub =
    hrActiveSub ??
    systemActiveSub ??
    (location.pathname === '/customers'
      ? 'cust_list'
      : location.pathname === '/customers/new-individual'
        ? 'cust_new_indv'
        : location.pathname === '/customers/new-corporate'
          ? 'cust_new_corp'
          : location.pathname === '/customers/notes'
            ? 'cust_notes'
            : location.pathname.startsWith('/customers/documents')
              ? 'cust_doc'
              : location.pathname === '/customers/fees'
                ? 'cust_fees'
                : location.pathname === '/customers/campaigns'
                  ? 'cust_campaign'
                  : location.pathname.startsWith('/customers/')
                    ? 'cust_list'
                : location.pathname.startsWith('/agents/groups')
                  ? 'ag_group'
                  : location.pathname === '/agents/fees'
                    ? 'ag_fees'
                    : location.pathname === '/agents/authorized-persons/new'
                    ? 'ag_authperson'
                    : location.pathname.startsWith('/agents/authorized-persons/')
                      ? 'ag_authperson'
                      : location.pathname.startsWith('/agents/') && location.pathname !== '/agents'
                        ? 'ag_new'
                          : location.pathname === '/ops/fx'
                            ? 'op_fx'
                            : location.pathname === '/ops/reconciliation'
                              ? 'op_recon'
                              : location.pathname.startsWith('/ops/btrans')
                                ? 'op_btrans'
                                : location.pathname.startsWith('/ops/accounting')
                                  ? 'op_accounting'
                                  : location.pathname.startsWith('/ops/kyc')
                                    ? 'op_kyc'
                                    : location.pathname.startsWith('/approvals')
                                      ? 'op_approval'
                                      : location.pathname === '/documents/new'
                                        ? 'dms_new'
                                        : location.pathname.startsWith('/documents/types')
                                          ? 'dms_types'
                                            : location.pathname.startsWith('/reports')
                                              ? 'reports'
                                              : location.pathname === '/support/reports'
                                              ? 'supp_reports'
                                              : location.pathname.startsWith('/support/cases')
                                              ? location.pathname === '/support/cases/new'
                                                ? 'supp_new'
                                                : 'support'
                                              : location.pathname === '/banks/integrated'
                            ? 'bk_integrated'
                            : location.pathname === '/banks/accounts'
                              ? 'bk_accounts'
                              : location.pathname === '/banks/movements'
                                ? 'bk_movements'
                                : location.pathname === '/banks/reconciliation'
                                  ? 'bk_recon'
                                  : location.pathname === '/risk/score-definition'
                                    ? 'rk_score'
                                    : location.pathname === '/risk/limits'
                                      ? 'rk_limits'
                                      : location.pathname === '/risk/scores'
                                        ? 'rk_scores'
                                        : location.pathname.startsWith('/risk/fraud-rules')
                                          ? 'rk_fraud'
                                          : location.pathname.startsWith('/risk/cases')
                                            ? 'rk_cases'
                                            : location.pathname === '/risk/admin'
                                              ? 'rk_admin'
                          : location.pathname === '/transfers/manual'
                            ? 'tr_refund'
                            : /^\/transfers\/\d+$/.test(location.pathname)
                              ? 'tr_detail'
                              : /^\/wallets\/\d+\/activities$/.test(location.pathname)
                            ? 'wl_activity'
                            : /^\/wallets\/\d+$/.test(location.pathname)
                              ? 'wl_detail'
                              : null);

  const filteredMenuItems = filterMenuForRole(MENU_ITEMS, navigationRole);

  const translateMenu = (items: NavItem[]): Record<string, NavItem> => {
    const map: Record<string, NavItem> = {};
    for (const item of items) {
      map[item.id] = {
        ...item,
        label: t(item.label),
        kids: item.kids?.map((k) => ({ ...k, label: t(k.label) })),
      };
    }
    return map;
  };

  const menuById = translateMenu(filteredMenuItems);
  const sections: NavSection[] = filterNavSections(
    NAV_SECTIONS.map((s) => ({
      ...s,
      title: t(s.title),
    })),
    menuById,
  );

  const bc = BREADCRUMB_MAP[activeNav];
  const isNewIndividual = location.pathname === '/customers/new-individual';
  const isNewCorporate = location.pathname === '/customers/new-corporate';
  const isCustomerNotes = location.pathname === '/customers/notes';
  const isDocumentReview = location.pathname.startsWith('/customers/documents');
  const isCustomerFees = location.pathname === '/customers/fees';
  const isCustomerCampaigns = location.pathname === '/customers/campaigns';
  const isAuthorizedPersonForm = location.pathname.startsWith('/agents/authorized-persons');
  const isAgentGroups = location.pathname.startsWith('/agents/groups');
  const isAgentFees = location.pathname === '/agents/fees';
  const isAgentGroupAgents = /^\/agents\/groups\/[^/]+\/agents/.test(location.pathname);
  const isAgentForm =
    location.pathname.startsWith('/agents/') &&
    location.pathname !== '/agents' &&
    !isAuthorizedPersonForm &&
    !isAgentGroups &&
    !isAgentFees;
  const agentIdMatch = location.pathname.match(/^\/agents\/(\d+)/);
  const personIdMatch = location.pathname.match(/^\/agents\/authorized-persons\/(\d+)/);
  const agentCrumbLabel =
    location.pathname === '/agents/new'
      ? t('s_ag_new')
      : agentIdMatch
        ? agentsService.getById(Number(agentIdMatch[1]))?.name ?? t('ag_form_edit')
        : t('ag_form_edit');
  const authorizedPersonCrumbLabel =
    location.pathname === '/agents/authorized-persons/new'
      ? t('s_ag_authperson')
      : personIdMatch
        ? (() => {
            const d = authorizedPersonService.getById(personIdMatch[1]);
            return d ? `${d.firstName} ${d.lastName}`.trim() : t('ap2_form_edit');
          })()
        : t('ap2_form_edit');
  const groupCodeMatch = location.pathname.match(/^\/agents\/groups\/([^/]+)\/agents/);
  const assignmentGroupName = groupCodeMatch
    ? agentGroupsService.getByCode(groupCodeMatch[1]!)?.name ?? groupCodeMatch[1]
    : null;
  const isApprovalDetail = /^\/approvals\/\d+/.test(location.pathname);
  const isKycList = location.pathname === '/ops/kyc';
  const isKycDetail = /^\/ops\/kyc\/\d+/.test(location.pathname);
  const isAccountingPage = location.pathname === '/ops/accounting';
  const isBtransPage = location.pathname === '/ops/btrans';
  const isOpsReconPage = location.pathname === '/ops/reconciliation';
  const isOpsFxPage = location.pathname === '/ops/fx';
  const isDmsList = location.pathname === '/documents';
  const isDmsNew = location.pathname === '/documents/new';
  const isDmsTypes = location.pathname.startsWith('/documents/types');
  const isDmsTypesList = location.pathname === '/documents/types';
  const isDmsTypesNew = location.pathname === '/documents/types/new';
  const dmsTypeEditMatch = location.pathname.match(/^\/documents\/types\/([^/]+)\/edit$/);
  const isDmsTypesEdit = dmsTypeEditMatch != null;
  const dmsTypeFormCrumbLabel = isDmsTypesNew
    ? t('dms_type_new')
    : isDmsTypesEdit
      ? documentTypesService.getById(dmsTypeEditMatch![1]!)?.name ?? t('dms_type_edit')
      : null;
  const documentIdMatch = location.pathname.match(/^\/documents\/([^/]+)$/);
  const isDmsDetail =
    documentIdMatch != null && documentIdMatch[1] !== 'new' && !isDmsTypes;
  const dmsDetailLabel = documentIdMatch?.[1]
    ? documentsService.getById(role, documentIdMatch[1])?.fileName ?? documentIdMatch[1]
    : null;
  const isSupportList = location.pathname === '/support/cases';
  const isReports = location.pathname.startsWith('/reports');
  const isSystemRolesList = location.pathname === '/system/roles';
  const isSystemRolesNew = location.pathname === '/system/roles/new';
  const systemRoleIdMatch =
    location.pathname.match(/^\/system\/roles\/([^/]+)$/) &&
    location.pathname !== '/system/roles/new'
      ? location.pathname.match(/^\/system\/roles\/([^/]+)$/)
      : null;
  const systemRoleId = systemRoleIdMatch?.[1];
  const isSystemRoleDetail = systemRoleId != null && systemRoleId !== 'new';
  const systemRoleCrumbLabel = systemRoleId
    ? rolesService.getById(role, systemRoleId)?.role.name ?? systemRoleId
    : null;
  const isSystemUsersList = location.pathname === '/system/users';
  const isSystemParameters = location.pathname === '/system/parameters';
  const isSystemJobsList = location.pathname === '/system/jobs';
  const isSystemJobsNew = location.pathname === '/system/jobs/new';
  const systemJobIdMatch =
    location.pathname.match(/^\/system\/jobs\/([^/]+)$/) &&
    location.pathname !== '/system/jobs/new'
      ? location.pathname.match(/^\/system\/jobs\/([^/]+)$/)
      : null;
  const systemJobId = systemJobIdMatch?.[1];
  const isSystemJobDetail = systemJobId != null;
  const isSystemNotificationsList = location.pathname === '/system/notifications';
  const isSystemNotificationsNew = location.pathname === '/system/notifications/new';
  const systemTemplateIdMatch =
    location.pathname.match(/^\/system\/notifications\/([^/]+)$/) &&
    location.pathname !== '/system/notifications/new'
      ? location.pathname.match(/^\/system\/notifications\/([^/]+)$/)
      : null;
  const systemTemplateId = systemTemplateIdMatch?.[1];
  const isSystemTemplateDetail = systemTemplateId != null;
  const isSystemIntegrationsList = location.pathname === '/system/integrations';
  const isSystemIntegrationsNew = location.pathname === '/system/integrations/new';
  const systemIntegrationIdMatch =
    location.pathname.match(/^\/system\/integrations\/([^/]+)$/) &&
    location.pathname !== '/system/integrations/new'
      ? location.pathname.match(/^\/system\/integrations\/([^/]+)$/)
      : null;
  const systemIntegrationId = systemIntegrationIdMatch?.[1];
  const isSystemIntegrationDetail = systemIntegrationId != null;
  const systemUserIdMatch =
    location.pathname.match(/^\/system\/users\/([^/]+)$/) ??
    location.pathname.match(/^\/system\/users\/([^/]+)\/activities$/);
  const systemUserId = systemUserIdMatch?.[1];
  const isSystemUserDetail = systemUserId != null && !location.pathname.endsWith('/activities');
  const isSystemUserActivities = /^\/system\/users\/[^/]+\/activities$/.test(location.pathname);
  const systemUserCrumbLabel = systemUserId
    ? usersService.getById(role, systemUserId)?.fullName ?? systemUserId
    : null;
  const isHrLeavesList = location.pathname === '/hr/leave';
  const isHrLeavesNew = location.pathname === '/hr/leave/new';
  const hrLeaveIdMatch =
    location.pathname.match(/^\/hr\/leave\/([^/]+)$/) &&
    location.pathname !== '/hr/leave/new'
      ? location.pathname.match(/^\/hr\/leave\/([^/]+)$/)
      : null;
  const hrLeaveId = hrLeaveIdMatch?.[1];
  const isHrLeaveDetail = hrLeaveId != null;
  const hrLeaveCrumbLabel = hrLeaveId ? (getLeaveById(hrLeaveId)?.id ?? hrLeaveId) : null;
  const isHrEmployeesList = location.pathname === '/hr/employees';
  const isHrEmployeesNew = location.pathname === '/hr/employees/new';
  const hrEmployeeIdMatch =
    location.pathname.match(/^\/hr\/employees\/([^/]+)$/) &&
    location.pathname !== '/hr/employees/new'
      ? location.pathname.match(/^\/hr\/employees\/([^/]+)$/)
      : null;
  const hrEmployeeId = hrEmployeeIdMatch?.[1];
  const isHrEmployeeDetail = hrEmployeeId != null;
  const hrEmployeeCrumbLabel = hrEmployeeId
    ? (() => {
        const d = employeeDetailService.getById(hrEmployeeId);
        return d ? `${d.firstName} ${d.lastName}`.trim() : hrEmployeeId;
      })()
    : null;
  const isSupportReports = location.pathname === '/support/reports';
  const isSupportNew = location.pathname === '/support/cases/new';
  const supportCaseIdMatch = location.pathname.match(/^\/support\/cases\/(\d+)$/);
  const isSupportEdit = supportCaseIdMatch != null;
  const supportCaseCrumbLabel = isSupportEdit
    ? supportCasesService.getDetail(role, getCurrentUser(role).id, Number(supportCaseIdMatch![1]))?.caseNo ??
      supportCaseIdMatch![1]
    : null;
  const opsSubId = OPS_PATH_SUB_ID[location.pathname];
  const isOpsSubPage =
    opsSubId != null && !isApprovalDetail && !isKycDetail && !isOpsReconPage && !isOpsFxPage;
  const kycReviewIdMatch = location.pathname.match(/^\/ops\/kyc\/(\d+)/);
  const kycCrumbLabel = kycReviewIdMatch
    ? kycReviewsService.getById(Number(kycReviewIdMatch[1]), role)?.entityNo ?? kycReviewIdMatch[1]
    : null;
  const walletIdMatch = location.pathname.match(/^\/wallets\/(\d+)/);
  const isWalletActivities = /^\/wallets\/\d+\/activities$/.test(location.pathname);
  const isWalletDetail = /^\/wallets\/\d+$/.test(location.pathname);
  const walletCrumbLabel = walletIdMatch
    ? walletsService.getById(Number(walletIdMatch[1]), role)?.walletNo ?? walletIdMatch[1]
    : null;
  const transactionIdMatch = location.pathname.match(/^\/transfers\/(\d+)/);
  const isTransferDetail = /^\/transfers\/\d+$/.test(location.pathname);
  const [transferCrumbLabel, setTransferCrumbLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!transactionIdMatch) {
      setTransferCrumbLabel(null);
      return;
    }
    const txId = Number(transactionIdMatch[1]);
    void transactionsService.getById(txId, role).then((tx) => {
      setTransferCrumbLabel(tx?.txNo ?? transactionIdMatch[1]!);
    });
  }, [transactionIdMatch, role]);
  const isManualTransfer = location.pathname.startsWith('/transfers/manual');
  const banksSubId = BANKS_PATH_SUB_ID[location.pathname];
  const isBanksSubPage = banksSubId != null;
  const riskSubId = RISK_PATH_SUB_ID[location.pathname];
  const isRiskSubPage = riskSubId != null;
  const isRiskDashboard = location.pathname === '/risk';
  const fraudRuleIdMatch = location.pathname.match(/^\/risk\/fraud-rules\/([^/]+)$/);
  const isFraudRuleDetail = fraudRuleIdMatch != null;
  const fraudRuleCrumbLabel =
    fraudRuleIdMatch?.[1] === 'new'
      ? t('fr_new_rule')
      : fraudRuleIdMatch?.[1]
        ? fraudRulesService.getDetail(fraudRuleIdMatch[1], role)?.rule.title ?? fraudRuleIdMatch[1]
        : null;
  const fraudCaseIdMatch = location.pathname.match(/^\/risk\/cases\/([^/]+)$/);
  const isFraudCaseDetail = fraudCaseIdMatch != null;
  const fraudCaseCrumbLabel = fraudCaseIdMatch?.[1]
    ? fraudCasesService.getById(fraudCaseIdMatch[1], role)?.id ?? fraudCaseIdMatch[1]
    : null;
  const breadcrumb =
    activeNav !== 'home' && bc ? (
      <Breadcrumb
        homeLabel={t('page_title')}
        homeHref="/"
        crumbs={[
          { label: t(bc.section) },
          {
            label: t(bc.label),
            href:
              activeNav === 'customers'
                ? '/customers'
                : activeNav === 'agents'
                  ? '/agents'
                  : activeNav === 'ops'
                    ? getOpsMenuDefaultHref(role) ?? '/approvals'
                    : activeNav === 'transfers'
                      ? '/transfers'
                      : activeNav === 'banks'
                        ? '/banks'
                        : activeNav === 'risk'
                          ? '/risk'
                          : activeNav === 'dms'
                            ? '/documents'
                            : (activeNav as string) === 'support'
                              ? '/support/cases'
                              : (activeNav as string) === 'reports'
                                ? '/reports'
                                : activeNav === 'system'
                                  ? getSystemMenuDefaultHref(role) ?? '/system/users'
                                  : activeNav === 'hr'
                                    ? '/hr/employees'
                                    : activeNav === 'playground'
                                      ? '/playground'
                                      : '/wallets',
          },
          ...(isNewIndividual ? [{ label: t('s_cust_new_indv') }] : []),
          ...(isNewCorporate ? [{ label: t('s_cust_new_corp') }] : []),
          ...(isCustomerNotes ? [{ label: t('s_cust_notes') }] : []),
          ...(isDocumentReview ? [{ label: t('s_cust_doc') }] : []),
          ...(isCustomerFees ? [{ label: t('s_cust_fees') }] : []),
          ...(isCustomerCampaigns ? [{ label: t('s_cust_campaign') }] : []),
          ...(isAgentForm ? [{ label: agentCrumbLabel }] : []),
          ...(isAuthorizedPersonForm
            ? [{ label: t('s_ag_authperson'), href: '/agents/authorized-persons/new' }, { label: authorizedPersonCrumbLabel }]
            : []),
          ...(isAgentGroups && !isAgentGroupAgents ? [{ label: t('s_ag_group') }] : []),
          ...(isAgentFees ? [{ label: t('s_cust_fees') }] : []),
          ...(isAgentGroupAgents
            ? [
                { label: t('s_ag_group'), href: '/agents/groups' },
                { label: assignmentGroupName ?? '—' },
                { label: t('aga_title') },
              ]
            : []),
          ...(isOpsSubPage ? [{ label: t(OPS_SUB_LABEL_KEYS[opsSubId]) }] : []),
          ...(isApprovalDetail ? [{ label: t('s_op_approval'), href: '/approvals' }, { label: t('ap_detail') }] : []),
          ...(isKycDetail ? [{ label: t('nav_kyc'), href: '/ops/kyc' }, { label: kycCrumbLabel ?? '—' }] : []),
          ...(isOpsReconPage ? [{ label: t('s_op_recon') }] : []),
          ...(isOpsFxPage ? [{ label: t('s_op_fx') }] : []),
          ...(isDmsNew ? [{ label: t('s_dms_new') }] : []),
          ...(isDmsTypesList ? [{ label: t('s_dms_types') }] : []),
          ...(isDmsTypesNew || isDmsTypesEdit
            ? [
                { label: t('s_dms_types'), href: '/documents/types' },
                { label: dmsTypeFormCrumbLabel ?? '—' },
              ]
            : []),
          ...(isDmsDetail ? [{ label: dmsDetailLabel ?? '—' }] : []),
          ...(isReports ? [{ label: t('nav_reports') }] : []),
          ...(isSystemRolesList ? [{ label: t('s_sys_roles') }] : []),
          ...(isSystemRolesNew
            ? [
                { label: t('s_sys_roles'), href: '/system/roles' },
                { label: t('rol_new') },
              ]
            : []),
          ...(isSystemRoleDetail && systemRoleId
            ? [
                { label: t('s_sys_roles'), href: '/system/roles' },
                { label: systemRoleCrumbLabel ?? '—' },
              ]
            : []),
          ...(location.pathname === '/system/approval-rules'
            ? [{ label: t('s_sys_approval_rules') }]
            : []),
          ...(isSystemParameters ? [{ label: t('rm_panel_params') }] : []),
          ...(isSystemNotificationsList ? [{ label: t('s_sys_notifications') }] : []),
          ...(isSystemNotificationsNew
            ? [
                { label: t('s_sys_notifications'), href: '/system/notifications' },
                { label: t('nt_new_template') },
              ]
            : []),
          ...(isSystemTemplateDetail && systemTemplateId
            ? [
                { label: t('s_sys_notifications'), href: '/system/notifications' },
                {
                  label:
                    notificationTemplatesService.getById(role, systemTemplateId)?.name ??
                    systemTemplateId,
                },
              ]
            : []),
          ...(isSystemJobsList ? [{ label: t('s_sys_scheduled') }] : []),
          ...(isSystemJobsNew
            ? [
                { label: t('s_sys_scheduled'), href: '/system/jobs' },
                { label: t('sj_new_job') },
              ]
            : []),
          ...(isSystemJobDetail && systemJobId
            ? [
                { label: t('s_sys_scheduled'), href: '/system/jobs' },
                {
                  label:
                    scheduledJobsService.getById(role, systemJobId)?.name ?? systemJobId,
                },
              ]
            : []),
          ...(isSystemIntegrationsList ? [{ label: t('s_sys_integrations') }] : []),
          ...(isSystemIntegrationsNew
            ? [
                { label: t('s_sys_integrations'), href: '/system/integrations' },
                { label: t('int_new') },
              ]
            : []),
          ...(isSystemIntegrationDetail && systemIntegrationId
            ? [
                { label: t('s_sys_integrations'), href: '/system/integrations' },
                {
                  label:
                    integrationsService.getById(role, systemIntegrationId)?.name ??
                    systemIntegrationId,
                },
              ]
            : []),
          ...(isHrLeavesList ? [{ label: t('s_hr_leave') }] : []),
          ...(isHrLeavesNew
            ? [
                { label: t('s_hr_leave'), href: '/hr/leave' },
                { label: t('s_hr_leave_new') },
              ]
            : []),
          ...(isHrLeaveDetail && hrLeaveId
            ? [
                { label: t('s_hr_leave'), href: '/hr/leave' },
                { label: hrLeaveCrumbLabel ?? '—' },
              ]
            : []),
          ...(isHrEmployeesList ? [{ label: t('s_hr_employees') }] : []),
          ...(isHrEmployeesNew
            ? [
                { label: t('s_hr_employees'), href: '/hr/employees' },
                { label: t('s_hr_new_employee') },
              ]
            : []),
          ...(isHrEmployeeDetail && hrEmployeeId
            ? [
                { label: t('s_hr_employees'), href: '/hr/employees' },
                { label: hrEmployeeCrumbLabel ?? '—' },
              ]
            : []),
          ...(isSystemUsersList ? [{ label: t('s_sys_users') }] : []),
          ...((isSystemUserDetail || isSystemUserActivities) && systemUserId
            ? [
                { label: t('s_sys_users'), href: '/system/users' },
                {
                  label: systemUserCrumbLabel ?? '—',
                  href: isSystemUserActivities ? `/system/users/${systemUserId}` : undefined,
                },
                ...(isSystemUserActivities ? [{ label: t('usr_activities') }] : []),
              ]
            : []),
          ...(isSupportList ? [{ label: t('m_support') }] : []),
          ...(isSupportReports
            ? [
                { label: t('m_support'), href: '/support/cases' },
                { label: t('s_supp_reports') },
              ]
            : []),
          ...(isSupportNew || isSupportEdit
            ? [
                { label: t('m_support'), href: '/support/cases' },
                { label: isSupportNew ? t('s_supp_new') : (supportCaseCrumbLabel ?? '—') },
              ]
            : []),
          ...(isWalletDetail || isWalletActivities
            ? [
                { label: walletCrumbLabel ?? '—' },
                ...(isWalletActivities ? [{ label: t('wd_activities') }] : []),
              ]
            : []),
          ...(isTransferDetail
            ? [{ label: transferCrumbLabel ?? '—' }]
            : []),
          ...(isManualTransfer ? [{ label: t('s_tr_refund') }] : []),
          ...(isBanksSubPage ? [{ label: t(BANKS_SUB_LABEL_KEYS[banksSubId]) }] : []),
          ...(isRiskDashboard ? [{ label: t('rc_dashboard_crumb') }] : []),
          ...(isRiskSubPage && !isFraudRuleDetail && !isFraudCaseDetail
            ? [{ label: t(RISK_SUB_LABEL_KEYS[riskSubId]) }]
            : []),
          ...(isFraudRuleDetail
            ? [
                { label: t('s_rk_fraud'), href: '/risk/fraud-rules' },
                { label: fraudRuleCrumbLabel ?? '—' },
              ]
            : []),
          ...(isFraudCaseDetail
            ? [
                { label: t('s_rk_cases'), href: '/risk/cases' },
                { label: fraudCaseCrumbLabel ?? '—' },
              ]
            : []),
        ]}
        LinkComponent={Link as React.ElementType}
      />
    ) : null;

  const roleKey = `role_${role}` as 'nav_ops';
  const accountRoleKey = accountRole ? (`role_${accountRole}` as 'nav_ops') : null;
  const showAlltestEffective = isAllAccessRole(role);
  const showAlltestAccount = accountRole === 'alltest';

  return (
    <SettingsProvider openSettings={openSettings}>
      <RoleUrlSync />
      <AppShell
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed(!collapsed)}
        sections={sections}
        menuById={menuById}
        activeNav={activeNav}
        activeSub={activeSub}
        breadcrumb={breadcrumb}
        LinkComponent={Link as React.ElementType}
        sidebarLabels={{
          comingSoon: t('coming_soon'),
          collapse: t('collapse_menu'),
          expand: t('expand_menu'),
          version: 'v2.14.0',
          buildDate: new Date().toISOString().slice(0, 10),
        }}
        topbarProps={{
          brand: t('brand'),
          env: t('env'),
          searchPlaceholder: t('search_ph'),
          roleLabel: t(roleKey),
          roleCycleTitle: isDemoRoleOverride && accountRoleKey
            ? `${t('role_cycle_hint')} · ${t('role_account_label')}: ${t(accountRoleKey)}`
            : t('role_cycle_hint'),
          role,
          onCycleRole: accountRole ? cycleRole : undefined,
          roleBadge: showAlltestEffective ? <AlltestRoleBadge /> : undefined,
          onLogout: () => {
            logout();
            navigate('/login', { replace: true });
          },
          theme,
          onToggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
          notificationsLabel: t('notifications'),
          markAllReadLabel: lang === 'tr' ? 'Tümünü işaretle' : 'Mark all read',
          notifications: NOTIFS.map((n) => ({
            id: String(n.id),
            title: n.title,
            desc: n.desc,
            time: n.time,
            level: n.level as 'warn' | 'info' | 'danger' | 'ok',
            icon: NOTIF_ICONS[n.icon] ?? <Info size={14} />,
          })),
          settingsLabel: t('settings'),
          onOpenSettings: () => openSettings('app'),
          userName: user?.fullName ?? getCurrentUser(navigationRole).displayName,
          userRoleLabel: accountRoleKey ? t(accountRoleKey) : t(roleKey),
          userBadge:
            showAlltestAccount && !showAlltestEffective ? <AlltestRoleBadge compact /> : undefined,
          logoutLabel: t('logout'),
          logoutDesc: lang === 'tr' ? 'Oturumu sonlandır' : 'End session',
          settingsDesc: lang === 'tr' ? 'Parola, tema, dil…' : 'Password, theme, language…',
          lang,
          onLangChange: (value) => setLang(value as AppLanguage),
          langAriaLabel: t('s_language'),
          langOptions: [
            { value: 'tr', label: 'TR' },
            { value: 'en', label: 'EN' },
            { value: 'ar', label: 'AR' },
          ],
        }}
      >
        <DemoModeBanner />
        <Outlet />
      </AppShell>
      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialTab={settingsTab}
      />
    </SettingsProvider>
  );
}

export function RootLayout() {
  return (
    <ThemeProvider>
      <I18nThemeSync>
        <ThemeAwarePreferences>
          <LayoutInner />
        </ThemeAwarePreferences>
      </I18nThemeSync>
    </ThemeProvider>
  );
}

function ThemeAwarePreferences({ children }: { children: React.ReactNode }) {
  const { lang } = useThemeSettings();
  const { role } = useRole();
  const userId = getCurrentUser(role).id;
  return (
    <UserPreferencesProvider lang={lang} userId={userId}>
      {children}
    </UserPreferencesProvider>
  );
}
