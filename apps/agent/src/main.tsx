import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@epay/ui';
import { AuthProvider } from '@/domain/auth-context';
import { RoleProvider } from '@/domain/role-context';
import { router } from '@/routes';
import '@/lib/i18n';
import { bootstrapDataLayer } from '@/lib/data-layer';
import './index.css';

void bootstrapDataLayer().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider>
        <RoleProvider>
          <RouterProvider router={router} />
          <Toaster />
        </RoleProvider>
      </AuthProvider>
    </StrictMode>,
  );
});
