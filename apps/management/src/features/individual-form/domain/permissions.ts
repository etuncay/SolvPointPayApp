import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { IndividualCustomerPermissions } from './types';

/** Spec §3 — bireysel müşteri form rol matrisi */
export function getIndividualCustomerPermissions(
  role: BackOfficeRole,
): IndividualCustomerPermissions {
  if (isAllAccessRole(role)) {
    return { insert: true, update: true, view: true, block: true, unblock: true, draft: true };
  }
  switch (role) {
    case 'ops':
      return {
        insert: true,
        update: true,
        view: true,
        block: true,
        unblock: true,
        draft: true,
      };
    case 'compliance':
      return {
        insert: false,
        update: true,
        view: true,
        block: true,
        unblock: true,
        draft: false,
      };
    case 'management':
      return {
        insert: true,
        update: true,
        view: true,
        block: true,
        unblock: true,
        draft: true,
      };
    default:
      return {
        insert: false,
        update: false,
        view: true,
        block: false,
        unblock: false,
        draft: false,
      };
  }
}
