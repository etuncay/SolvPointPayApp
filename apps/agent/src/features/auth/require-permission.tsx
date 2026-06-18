import { useAgentSession } from '@/hooks/use-agent-session';
import {
  canAccessAgentRoute,
  getAgentRouteForbiddenCopy,
  type AgentRoutePermissionKey,
} from '@/domain/route-permissions';
import { ForbiddenPage } from '@/pages/forbidden-page';

/** Temsilci yetkisi yoksa ForbiddenPage. */
export function RequirePermission({
  permission,
  children,
}: {
  permission: AgentRoutePermissionKey;
  children: React.ReactNode;
}) {
  const session = useAgentSession();
  if (!session || !canAccessAgentRoute(permission, session.profile)) {
    return <ForbiddenPage {...getAgentRouteForbiddenCopy(permission)} />;
  }
  return <>{children}</>;
}
