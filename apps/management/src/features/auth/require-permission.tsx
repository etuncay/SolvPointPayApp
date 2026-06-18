import { useRole } from '@/domain/role-context';
import { getRouteForbiddenCopy } from '@/domain/route-permissions';
import { canAccessRoute, type RoutePermissionKey } from '@/domain/route-permissions';
import { ForbiddenPage } from '@/pages/forbidden-page';

/** Rol izni yoksa ForbiddenPage (demo rol değişiminde tutarlı UX). */
export function RequirePermission({
  permission,
  children,
}: {
  permission: RoutePermissionKey;
  children: React.ReactNode;
}) {
  const { role } = useRole();
  if (!canAccessRoute(permission, role)) {
    return <ForbiddenPage {...getRouteForbiddenCopy(permission)} />;
  }
  return <>{children}</>;
}
