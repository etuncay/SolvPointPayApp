import { Navigate } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { getHrMenuDefaultHref } from './domain/nav-permissions';

/** /hr → rolün ilk görünür İK alt modülü */
export function HrIndexRedirect() {
  const { role } = useRole();
  const href = getHrMenuDefaultHref(role);
  if (!href) return <Navigate to="/" replace />;
  return <Navigate to={href} replace />;
}
