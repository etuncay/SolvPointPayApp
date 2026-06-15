import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/app/AppLayout';
import { RequireAuth } from '@/app/RequireAuth';
import { LoginPage } from '@/features/auth/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { HomePage } from '@/features/home/HomePage';
import { ActivityPage } from '@/features/activity/ActivityPage';
import { TopupPage } from '@/features/topup/TopupPage';
import { SendHubPage } from '@/features/transfer/SendHubPage';
import { RecipientsPage } from '@/features/transfer/RecipientsPage';
import { DomesticTransferPage } from '@/features/transfer/DomesticTransferPage';
import { IntlTransferPage } from '@/features/transfer/IntlTransferPage';
import { ReceivePage } from '@/features/transfer/ReceivePage';
import { ConfirmPage } from '@/features/transfer/ConfirmPage';
import { SuccessPage } from '@/features/transfer/SuccessPage';
import { ComplaintPage } from '@/features/complaints/ComplaintPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'activity', element: <ActivityPage /> },
      { path: 'topup', element: <TopupPage /> },
      { path: 'send', element: <SendHubPage /> },
      { path: 'send/recipients', element: <RecipientsPage /> },
      { path: 'send/domestic', element: <DomesticTransferPage /> },
      { path: 'send/intl', element: <IntlTransferPage /> },
      { path: 'receive', element: <ReceivePage /> },
      { path: 'confirm', element: <ConfirmPage /> },
      { path: 'success', element: <SuccessPage /> },
      { path: 'complaints', element: <ComplaintPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
