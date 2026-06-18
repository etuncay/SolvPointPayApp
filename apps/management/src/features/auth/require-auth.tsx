import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/domain/auth-context';

/**
 * Oturum yoksa /login'e yönlendirir.
 * Rol / izin kontrolü yapmaz — route guard (`RequirePermission`) ve menü
 * `useNavigationRole().navigationRole` ile oturum rolüne hizalanır.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <>{children}</>;
}
