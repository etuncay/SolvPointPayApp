import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { authed, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return null;
  }

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
