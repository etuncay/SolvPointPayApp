import { Navigate } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { getOpsMenuDefaultHref } from './domain/nav-permissions';

/** /ops → rolün ilk görünür alt modülü */
export function OpsIndexRedirect() {
  const { role } = useRole();
  const href = getOpsMenuDefaultHref(role);
  if (!href) return <Navigate to="/" replace />;
  return <Navigate to={href} replace />;
}
