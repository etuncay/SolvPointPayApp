import { createBrowserRouter } from 'react-router-dom';
import { FormMode } from '@epay/ui';
import { RootLayout } from '@/layouts/root-layout';
import { NotFoundPage } from '@/pages/not-found-page';
import { RouteErrorPage } from '@/pages/route-error-page';
import { LoginPage, RegisterPage, RequireAuth } from '@/features/auth';
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

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
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
      { path: 'customers', element: <CustomersPage /> },
      { path: 'customers/new-individual', element: <IndividualFormPage mode="new" /> },
      { path: 'customers/:customerId/individual', element: <IndividualFormPage mode="edit" /> },
      { path: 'customers/new-corporate', element: <CorporateFormPage mode="new" /> },
      { path: 'customers/:customerId/corporate', element: <CorporateFormPage /> },
      { path: 'customers/notes', element: <CustomerNotesPage /> },
      { path: 'customers/documents/review', element: <DocumentReviewPage /> },
      { path: 'customers/documents/:documentId/review', element: <DocumentReviewDetailPage /> },
      { path: 'customers/fees', element: <CustomerFeesPage /> },
      { path: 'customers/campaigns', element: <CustomerCampaignsPage /> },
      { path: 'agents', element: <AgentsPage /> },
      { path: 'agents/new', element: <AgentFormPage mode="new" /> },
      { path: 'agents/groups', element: <AgentGroupsPage /> },
      { path: 'agents/groups/:groupCode/agents', element: <AgentGroupAssignmentsPage /> },
      { path: 'agents/fees', element: <AgentFeesPage /> },
      { path: 'agents/authorized-persons/new', element: <AuthorizedPersonFormPage /> },
      { path: 'agents/authorized-persons/:personId', element: <AuthorizedPersonFormPage /> },
      { path: 'agents/:agentId', element: <AgentFormPage mode="edit" /> },
      { path: 'wallets', element: <WalletsPage /> },
      { path: 'wallets/:walletId', element: <WalletDetailPage /> },
      { path: 'wallets/:walletId/activities', element: <WalletActivitiesPage /> },
      { path: 'transfers', element: <TransfersPage /> },
      { path: 'transfers/manual', element: <ManualCorrectionPage /> },
      { path: 'transfers/:transactionId', element: <TransactionDetailPage /> },
      { path: 'banks', element: <BanksIndexRedirect /> },
      { path: 'banks/integrated', element: <IntegratedBanksPage /> },
      { path: 'banks/accounts', element: <CompanyBankAccountsPage /> },
      { path: 'banks/movements', element: <BankMovementsPage /> },
      { path: 'banks/reconciliation', element: <BankReconciliationPage /> },
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
      { path: 'approvals', element: <ApprovalsPage /> },
      { path: 'approvals/:approvalId', element: <ApprovalDetailPage /> },
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
      { path: 'playground/new', element: <PlaygroundFormPage mode={FormMode.Create} /> },
      { path: 'playground/edit/:id', element: <PlaygroundFormPage mode={FormMode.Update} /> },
      { path: 'playground/delete/:id', element: <PlaygroundFormPage mode={FormMode.Delete} /> },
      { path: 'playground/view/:id', element: <PlaygroundFormPage mode={FormMode.View} /> },
      { path: 'playground', element: <PlaygroundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
