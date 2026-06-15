import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { BankMovementPermissions } from './types';

/** Spec §3 — finance, management, ops: salt-okunur list/view/export */
export function getBankMovementPermissions(role: BackOfficeRole): BankMovementPermissions {
  if (isAllAccessRole(role)) {
    return { list: true, view: true, export: true, insert: true, update: true };
  }
  switch (role) {
    case 'finance':
    case 'management':
    case 'ops':
      return {
        list: true,
        view: true,
        export: true,
        insert: false,
        update: false,
      };
    default:
      return {
        list: false,
        view: false,
        export: false,
        insert: false,
        update: false,
      };
  }
}
