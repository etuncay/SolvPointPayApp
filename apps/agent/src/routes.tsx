import { Navigate, createBrowserRouter } from 'react-router-dom';
import { FormMode } from '@epay/ui';
import { RootLayout } from '@/layouts/root-layout';
import { NotFoundPage } from '@/pages/not-found-page';
import { RouteErrorPage } from '@/pages/route-error-page';
import { StubPage } from '@/pages/stub-page';
import { LoginPage, RegisterPage, RequireAuth, RequirePermission, RegisterGuard } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard/dashboard-page';
import { AccountsPage } from '@/features/accounts/accounts-page';
import { CustomerRegistrationPage } from '@/features/customer-registration';
import { CustomerSearchPage } from '@/features/customer-search';
import { WithdrawalPage } from '@/features/withdrawal';
import { TransferPage } from '@/features/agent-transfers';
import { TransactionHistoryPage } from '@/features/transaction-history';
import { FeedbackPage } from '@/features/agent-feedback';
import { PlaygroundFormPage, PlaygroundPage } from '@/features/playground';
import { DevOnlyRoute } from '@/components/dev-only-route';
import { ConfirmationPage } from '@/features/transaction-confirmation/confirmation-page';
import { SignedReceiptPage } from '@/features/transaction-confirmation/signed-receipt-page';
import { TransactionSuccessPage } from '@/features/transaction-confirmation/success-page';
import { ReceiptPrintPage } from '@/features/receipt/receipt-print-page';
import { AGENT_PATHS } from '@/config/agent-nav-paths';
import type { AgentRoutePermissionKey } from '@/domain/route-permissions';
import type { ReactNode } from 'react';

function guarded(permission: AgentRoutePermissionKey, element: ReactNode) {
  return <RequirePermission permission={permission}>{element}</RequirePermission>;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterGuard><RegisterPage /></RegisterGuard> },
  {
    path: '/receipt/:id',
    element: (
      <RequireAuth>
        <ReceiptPrintPage />
      </RequireAuth>
    ),
  },
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
      { path: 'accounts', element: guarded('accounts.view', <AccountsPage />) },
      { path: 'customers/new', element: guarded('customers.create', <CustomerRegistrationPage mode="new" />) },
      { path: 'customers', element: guarded('customers.list', <CustomerSearchPage />) },
      {
        path: 'customers/:customerId',
        element: guarded('customers.edit', <CustomerRegistrationPage mode="edit" />),
      },
      { path: 'withdrawal', element: guarded('withdrawal.access', <WithdrawalPage />) },
      {
        path: 'transfers',
        element: <Navigate to={AGENT_PATHS.transfers.ownWallet} replace />,
      },
      { path: 'transfers/own-wallet', element: guarded('transfers.access', <TransferPage variant="ownWallet" />) },
      { path: 'transfers/bank-account', element: guarded('transfers.access', <TransferPage variant="bankAccount" />) },
      { path: 'transfers/person', element: guarded('transfers.access', <TransferPage variant="person" />) },
      { path: 'transfers/abroad', element: guarded('transfers.access', <TransferPage variant="abroad" />) },
      { path: 'transactions', element: guarded('transactions.list', <TransactionHistoryPage />) },
      { path: 'transactions/:id', element: guarded('transactions.view', <ConfirmationPage />) },
      {
        path: 'transactions/:id/approve',
        element: guarded('transactions.approve', <ConfirmationPage requestApprove />),
      },
      {
        path: 'transactions/:id/signed-receipt',
        element: guarded('transactions.approve', <SignedReceiptPage />),
      },
      {
        path: 'transactions/:id/success',
        element: guarded('transactions.approve', <TransactionSuccessPage />),
      },
      { path: 'feedback', element: guarded('feedback.access', <FeedbackPage />) },
      {
        path: 'playground/new',
        element: (
          <DevOnlyRoute>
            {guarded('playground.access', <PlaygroundFormPage mode={FormMode.Create} />)}
          </DevOnlyRoute>
        ),
      },
      {
        path: 'playground/edit/:id',
        element: (
          <DevOnlyRoute>
            {guarded('playground.access', <PlaygroundFormPage mode={FormMode.Update} />)}
          </DevOnlyRoute>
        ),
      },
      {
        path: 'playground/delete/:id',
        element: (
          <DevOnlyRoute>
            {guarded('playground.access', <PlaygroundFormPage mode={FormMode.Delete} />)}
          </DevOnlyRoute>
        ),
      },
      {
        path: 'playground/view/:id',
        element: (
          <DevOnlyRoute>
            {guarded('playground.access', <PlaygroundFormPage mode={FormMode.View} />)}
          </DevOnlyRoute>
        ),
      },
      {
        path: 'playground',
        element: (
          <DevOnlyRoute>
            {guarded('playground.access', <PlaygroundPage />)}
          </DevOnlyRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
