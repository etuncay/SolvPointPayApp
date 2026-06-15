import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { AgentGroupPermissions } from './types';

/** Spec §3 — ops + finance tam CRUD; diğerleri list only */
export function getAgentGroupPermissions(role: BackOfficeRole): AgentGroupPermissions {
  if (isAllAccessRole(role)) {
    return { list: true, insert: true, update: true, deactivate: true, export: true };
  }
  switch (role) {
    case 'ops':
    case 'finance':
      return { list: true, insert: true, update: true, deactivate: true, export: true };
    default:
      return { list: true, insert: false, update: false, deactivate: false, export: false };
  }
}
