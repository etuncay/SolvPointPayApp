import { Navigate, createBrowserRouter } from 'react-router-dom';
import { FormMode } from '@epay/ui';
import { RootLayout } from '@/layouts/root-layout';
import { NotFoundPage } from '@/pages/not-found-page';
import { RouteErrorPage } from '@/pages/route-error-page';
import { StubPage } from '@/pages/stub-page';
import { LoginPage, RegisterPage, RequireAuth } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard/dashboard-page';
import { AccountsPage } from '@/features/accounts/accounts-page';
import { CustomerRegistrationPage } from '@/features/customer-registration';
import { CustomerSearchPage } from '@/features/customer-search';
import { WithdrawalPage } from '@/features/withdrawal';
import { TransferPage } from '@/features/agent-transfers';
import { TransactionHistoryPage } from '@/features/transaction-history';
import { FeedbackPage } from '@/features/agent-feedback';
import { PlaygroundFormPage, PlaygroundPage } from '@/features/playground';
import { ConfirmationPage } from '@/features/transaction-confirmation/confirmation-page';
import { SignedReceiptPage } from '@/features/transaction-confirmation/signed-receipt-page';
import { TransactionSuccessPage } from '@/features/transaction-confirmation/success-page';
import { ReceiptPrintPage } from '@/features/receipt/receipt-print-page';
import { AGENT_PATHS } from '@/config/agent-nav-paths';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
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
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'customers/new', element: <CustomerRegistrationPage mode="new" /> },
      { path: 'customers', element: <CustomerSearchPage /> },
      { path: 'customers/:customerId', element: <CustomerRegistrationPage mode="edit" /> },
      { path: 'withdrawal', element: <WithdrawalPage /> },
      {
        path: 'transfers',
        element: <Navigate to={AGENT_PATHS.transfers.ownWallet} replace />,
      },
      { path: 'transfers/own-wallet', element: <TransferPage variant="ownWallet" /> },
      { path: 'transfers/bank-account', element: <TransferPage variant="bankAccount" /> },
      { path: 'transfers/person', element: <TransferPage variant="person" /> },
      { path: 'transfers/abroad', element: <TransferPage variant="abroad" /> },
      { path: 'transactions', element: <TransactionHistoryPage /> },
      { path: 'transactions/:id', element: <ConfirmationPage /> },
      { path: 'transactions/:id/approve', element: <ConfirmationPage requestApprove /> },
      { path: 'transactions/:id/signed-receipt', element: <SignedReceiptPage /> },
      { path: 'transactions/:id/success', element: <TransactionSuccessPage /> },
      { path: 'feedback', element: <FeedbackPage /> },
      { path: 'playground/new', element: <PlaygroundFormPage mode={FormMode.Create} /> },
      { path: 'playground/edit/:id', element: <PlaygroundFormPage mode={FormMode.Update} /> },
      { path: 'playground/delete/:id', element: <PlaygroundFormPage mode={FormMode.Delete} /> },
      { path: 'playground/view/:id', element: <PlaygroundFormPage mode={FormMode.View} /> },
      { path: 'playground', element: <PlaygroundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
