export type {
  RoutePermissionChecker,
  RoutePermissionDefinition,
  RoutePermissionKey,
} from './route-permissions-map';
export {
  ROUTE_PERMISSIONS,
  canAccessPath,
  canAccessRoute,
  getRouteForbiddenCopy,
  getRoutePermissionDefinition,
  resolveRoutePermission,
} from './route-permissions-map';
