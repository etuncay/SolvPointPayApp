/** @deprecated 12.3 — master store: roles-store.ts */
export {
  getAppRoleById,
  listAssignableRoles,
  listAllAppRoles,
  APP_ROLES_SEED,
  type LegacyAppRole as AppRole,
} from './roles-store';

export type { AppRoleStatus } from '@/features/system/roles/domain/types';
