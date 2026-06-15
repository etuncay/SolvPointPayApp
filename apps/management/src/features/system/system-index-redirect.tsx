import { Navigate } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { getSystemMenuDefaultHref } from './domain/nav-permissions';

/** /system → rolün ilk görünür alt modülü (varsayılan 12.1) */
export function SystemIndexRedirect() {
  const { role } = useRole();
  const href = getSystemMenuDefaultHref(role);
  if (!href) return <Navigate to="/" replace />;
  return <Navigate to={href} replace />;
}
