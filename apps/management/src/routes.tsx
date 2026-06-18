import { createBrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { FormMode } from '@epay/ui';
import type { RoutePermissionKey } from '@/domain/route-permissions';
import { RootLayout } from '@/layouts/root-layout';
import { NotFoundPage } from '@/pages/not-found-page';
import { RouteErrorPage } from '@/pages/route-error-page';
import { LoginPage, RegisterPage, RequireAuth, RequirePermission, RegisterGuard } from '@/features/auth';
import { DevOnlyRoute } from '@/components/dev-only-route';
import { DashboardPage } from '@/features/dashboard';
import { ph } from '@/features/feature-placeholder';
import { PlaygroundFormPage, PlaygroundPage } from '@/features/playground';
import { CustomersPage } from '@/features/customers';
import { CustomerNotesPage } from '@/features/customer-notes';
import { DocumentReviewDetailPage, DocumentReviewPage } from '@/features/document-review';
import { CustomerFeesPage } from '@/features/customer-fees';
import { CustomerCampaignsPage } from '@/features/customer-campaigns';
import { AgentsPage } from '@/features/agents';
import { AgentFormPage } from '@/features/agent-form';
import { AuthorizedPersonFormPage } from '@/features/authorized-person-form';
import { AgentGroupsPage, AgentGroupAssignmentsPage } from '@/features/agent-groups';
import { AgentFeesPage } from '@/features/agent-fees';
import { WalletsPage, WalletDetailPage, WalletActivitiesPage } from '@/features/wallets';
import { TransfersPage, TransactionDetailPage, ManualCorrectionPage } from '@/features/transfers';
import { IndividualFormPage } from '@/features/individual-form';
import { CorporateFormPage } from '@/features/corporate-form';
import {
  BanksIndexRedirect,
  IntegratedBanksPage,
  CompanyBankAccountsPage,
  BankMovementsPage,
  BankReconciliationPage,
} from '@/features/banks';
import { SystemIndexRedirect } from '@/features/system/system-index-redirect';
import {
  UsersPage,
  UserDetailPage,
  UserActivitiesPage,
} from '@/features/system/users';
import { ApprovalRulesPage } from '@/features/system/approval-rules';
import { RolesPage, RoleFormPage, RoleDetailPage } from '@/features/system/roles';
import { ParametersPage } from '@/features/system/parameters';
import { ScheduledJobsPage, JobFormPage, JobDetailPage } from '@/features/system/scheduled-jobs';
import {
  NotificationTemplatesPage,
  TemplateFormPage,
  TemplateDetailPage,
} from '@/features/system/notifications';
import { IntegrationsPage, IntegrationFormPage, IntegrationDetailPage } from '@/features/system/integrations';
import { HrIndexRedirect } from '@/features/hr/hr-index-redirect';
import { EmployeesPage, EmployeeFormPage, LeavesPage, LeaveFormPage } from '@/features/hr';
import { ApprovalsPage, ApprovalDetailPage } from '@/features/approval-pool';
import { KycReviewsPage, KycReviewDetailPage } from '@/features/kyc-management';
import {
  OpsIndexRedirect,
  AccountingIntegrationsPage,
  BtransIntegrationsPage,
  FinancialReconciliationPage,
  FxManagementPage,
} from '@/features/operational-processes';
import {
  RiskCompliancePage,
  RiskScoreDefinitionPage,
  RiskLimitsPage,
  RiskScoresPage,
  FraudRulesPage,
  FraudRuleDetailPage,
  FraudCasesPage,
  FraudCaseDetailPage,
  RiskManagementPage,
} from '@/features/risk-compliance';
import {
  DocumentsPage,
  DocumentUploadPage,
  DocumentDetailPage,
  DocumentTypesPage,
  DocumentTypeFormPage,
} from '@/features/dms';
import { SupportCaseFormPage, SupportCasesPage, SupportReportsPage } from '@/features/support';
import { ReportsCatalogPage } from '@/features/reports';

function guarded(permission: RoutePermissionKey, element: ReactNode) {
  return <RequirePermission permission={permission}>{element}</RequirePermission>;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterGuard><RegisterPage /></RegisterGuard> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <RootLayout />
      </RequireAuth>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'customers', element: guarded('customers.list', <CustomersPage />) },
      {
        path: 'customers/new-individual',
        element: guarded('customers.individual.new', <IndividualFormPage mode="new" />),
      },
      {
        path: 'customers/:customerId/individual',
        element: guarded('customers.individual.edit', <IndividualFormPage mode="edit" />),
      },
      {
        path: 'customers/new-corporate',
        element: guarded('customers.corporate.new', <CorporateFormPage mode="new" />),
      },
      {
        path: 'customers/:customerId/corporate',
        element: guarded('customers.corporate.edit', <CorporateFormPage />),
      },
      { path: 'customers/notes', element: <CustomerNotesPage /> },
      { path: 'customers/documents/review', element: <DocumentReviewPage /> },
      { path: 'customers/documents/:documentId/review', element: <DocumentReviewDetailPage /> },
      { path: 'customers/fees', element: <CustomerFeesPage /> },
      { path: 'customers/campaigns', element: <CustomerCampaignsPage /> },
      { path: 'agents', element: guarded('agents.list', <AgentsPage />) },
      { path: 'agents/new', element: guarded('agents.form.new', <AgentFormPage mode="new" />) },
      { path: 'agents/groups', element: guarded('agents.groups', <AgentGroupsPage />) },
      {
        path: 'agents/groups/:groupCode/agents',
        element: guarded('agents.groups.assignments', <AgentGroupAssignmentsPage />),
      },
      { path: 'agents/fees', element: guarded('agents.fees', <AgentFeesPage />) },
      {
        path: 'agents/authorized-persons/new',
        element: guarded('agents.authorized-person', <AuthorizedPersonFormPage />),
      },
      {
        path: 'agents/authorized-persons/:personId',
        element: guarded('agents.authorized-person', <AuthorizedPersonFormPage />),
      },
      { path: 'agents/:agentId', element: guarded('agents.form.edit', <AgentFormPage mode="edit" />) },
      { path: 'wallets', element: guarded('wallets.list', <WalletsPage />) },
      { path: 'wallets/:walletId', element: guarded('wallets.detail', <WalletDetailPage />) },
      {
        path: 'wallets/:walletId/activities',
        element: guarded('wallets.activities', <WalletActivitiesPage />),
      },
      { path: 'transfers', element: guarded('transfers.list', <TransfersPage />) },
      { path: 'transfers/manual', element: guarded('transfers.manual', <ManualCorrectionPage />) },
      {
        path: 'transfers/:transactionId',
        element: guarded('transfers.detail', <TransactionDetailPage />),
      },
      { path: 'banks', element: <BanksIndexRedirect /> },
      { path: 'banks/integrated', element: guarded('banks.integrated', <IntegratedBanksPage />) },
      {
        path: 'banks/accounts',
        element: guarded('banks.accounts', <CompanyBankAccountsPage />),
      },
      { path: 'banks/movements', element: guarded('banks.movements', <BankMovementsPage />) },
      {
        path: 'banks/reconciliation',
        element: guarded('banks.reconciliation', <BankReconciliationPage />),
      },
      { path: 'support/cases', element: <SupportCasesPage /> },
      { path: 'support/cases/new', element: <SupportCaseFormPage /> },
      { path: 'support/cases/:caseId', element: <SupportCaseFormPage /> },
      { path: 'support/reports', element: <SupportReportsPage /> },
      { path: 'reports', element: <ReportsCatalogPage /> },
      { path: 'reports/:code', element: <ReportsCatalogPage /> },
      { path: 'system', element: <SystemIndexRedirect /> },
      { path: 'system/approval-rules', element: <ApprovalRulesPage /> },
      { path: 'system/roles', element: <RolesPage /> },
      { path: 'system/roles/new', element: <RoleFormPage /> },
      { path: 'system/roles/:roleId', element: <RoleDetailPage /> },
      { path: 'system/users', element: <UsersPage /> },
      { path: 'system/users/:userId', element: <UserDetailPage /> },
      { path: 'system/users/:userId/activities', element: <UserActivitiesPage /> },
      { path: 'system/parameters', element: <ParametersPage /> },
      { path: 'system/jobs', element: <ScheduledJobsPage /> },
      { path: 'system/jobs/new', element: <JobFormPage /> },
      { path: 'system/jobs/:jobId', element: <JobDetailPage /> },
      { path: 'system/notifications', element: <NotificationTemplatesPage /> },
      { path: 'system/notifications/new', element: <TemplateFormPage /> },
      { path: 'system/notifications/:templateId', element: <TemplateDetailPage /> },
      { path: 'system/integrations', element: <IntegrationsPage /> },
      { path: 'system/integrations/new', element: <IntegrationFormPage /> },
      { path: 'system/integrations/:integrationId', element: <IntegrationDetailPage /> },
      { path: 'risk', element: <RiskCompliancePage /> },
      { path: 'risk/score-definition', element: <RiskScoreDefinitionPage /> },
      { path: 'risk/limits', element: <RiskLimitsPage /> },
      { path: 'risk/scores', element: <RiskScoresPage /> },
      { path: 'risk/fraud-rules', element: <FraudRulesPage /> },
      { path: 'risk/fraud-rules/:ruleId', element: <FraudRuleDetailPage /> },
      { path: 'risk/cases', element: <FraudCasesPage /> },
      { path: 'risk/cases/:caseId', element: <FraudCaseDetailPage /> },
      { path: 'risk/admin', element: <RiskManagementPage /> },
      { path: 'approvals', element: guarded('approvals.list', <ApprovalsPage />) },
      { path: 'approvals/:approvalId', element: guarded('approvals.detail', <ApprovalDetailPage />) },
      { path: 'ops', element: <OpsIndexRedirect /> },
      { path: 'ops/kyc', element: <KycReviewsPage /> },
      { path: 'ops/kyc/:reviewId', element: <KycReviewDetailPage /> },
      { path: 'ops/accounting', element: <AccountingIntegrationsPage /> },
      { path: 'ops/btrans', element: <BtransIntegrationsPage /> },
      { path: 'ops/reconciliation', element: <FinancialReconciliationPage /> },
      { path: 'ops/fx', element: <FxManagementPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'documents/new', element: <DocumentUploadPage /> },
      { path: 'documents/types', element: <DocumentTypesPage /> },
      { path: 'documents/types/new', element: <DocumentTypeFormPage /> },
      { path: 'documents/types/:typeId/edit', element: <DocumentTypeFormPage /> },
      { path: 'documents/:documentId', element: <DocumentDetailPage /> },
      { path: 'hr', element: <HrIndexRedirect /> },
      { path: 'hr/employees', element: <EmployeesPage /> },
      { path: 'hr/employees/new', element: <EmployeeFormPage /> },
      { path: 'hr/employees/:employeeId', element: <EmployeeFormPage /> },
      { path: 'hr/leave', element: <LeavesPage /> },
      { path: 'hr/leave/new', element: <LeaveFormPage /> },
      { path: 'hr/leave/:leaveId', element: <LeaveFormPage /> },
      {
        path: 'playground/new',
        element: (
          <DevOnlyRoute>
            <PlaygroundFormPage mode={FormMode.Create} />
          </DevOnlyRoute>
        ),
      },
      {
        path: 'playground/edit/:id',
        element: (
          <DevOnlyRoute>
            <PlaygroundFormPage mode={FormMode.Update} />
          </DevOnlyRoute>
        ),
      },
      {
        path: 'playground/delete/:id',
        element: (
          <DevOnlyRoute>
            <PlaygroundFormPage mode={FormMode.Delete} />
          </DevOnlyRoute>
        ),
      },
      {
        path: 'playground/view/:id',
        element: (
          <DevOnlyRoute>
            <PlaygroundFormPage mode={FormMode.View} />
          </DevOnlyRoute>
        ),
      },
      {
        path: 'playground',
        element: (
          <DevOnlyRoute>
            <PlaygroundPage />
          </DevOnlyRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
