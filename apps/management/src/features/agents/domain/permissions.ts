import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { AgentPermissions } from './types';

/** Spec §3 — ops/compliance/management/finance matrisi */
export function getAgentPermissions(role: BackOfficeRole): AgentPermissions {
  if (isAllAccessRole(role)) {
    return { list: true, view: true, insert: true, update: true, delete: true, export: true };
  }
  switch (role) {
    case 'ops':
      return { list: true, view: true, insert: true, update: true, delete: false, export: true };
    case 'compliance':
      return { list: true, view: true, insert: false, update: true, delete: false, export: true };
    case 'management':
      return { list: true, view: true, insert: true, update: true, delete: true, export: true };
    case 'finance':
      return { list: true, view: true, insert: false, update: false, delete: false, export: false };
    default:
      return { list: true, view: true, insert: false, update: false, delete: false, export: false };
  }
}
