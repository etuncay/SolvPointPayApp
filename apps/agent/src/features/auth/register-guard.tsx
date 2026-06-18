import { Navigate } from 'react-router-dom';
import { isRegisterEnabled } from '@/lib/backoffice-auth';

export function RegisterGuard({ children }: { children: React.ReactNode }) {
  if (!isRegisterEnabled()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
