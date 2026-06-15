import type { BackOfficeRole } from '@epay/ui';
import { getAgentGroupPermissions } from './permissions';
import type { AssignmentPermissions } from './assignment-types';

/** Spec §3 — 3.3 ile aynı matris */
export function getAssignmentPermissions(role: BackOfficeRole): AssignmentPermissions {
  const p = getAgentGroupPermissions(role);
  return {
    list: p.list,
    insert: p.insert,
    remove: p.deactivate,
    export: p.export,
  };
}
