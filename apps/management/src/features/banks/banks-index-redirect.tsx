import { Navigate } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { getDefaultBanksHref } from './domain/nav-permissions';

export function BanksIndexRedirect() {
  const { role } = useRole();
  const href = getDefaultBanksHref(role);
  if (!href) return <Navigate to="/" replace />;
  return <Navigate to={href} replace />;
}
