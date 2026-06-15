import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { AgentFeePermissions } from './types';

/** Spec §3 — finance CRUD; ops list+export */
export function getAgentFeePermissions(role: BackOfficeRole): AgentFeePermissions {
  if (isAllAccessRole(role)) {
    return { list: true, insert: true, update: true, export: true };
  }
  switch (role) {
    case 'finance':
      return { list: true, insert: true, update: true, export: true };
    case 'ops':
      return { list: true, insert: false, update: false, export: true };
    default:
      return { list: true, insert: false, update: false, export: false };
  }
}
