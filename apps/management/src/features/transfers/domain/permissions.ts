import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { TransactionPermissions } from './types';

/** Spec §3 — liste/export; bloke/iptal 5.1'de */
export function getTransactionPermissions(role: BackOfficeRole): TransactionPermissions {
  if (isAllAccessRole(role)) {
    return { list: true, view: true, export: true };
  }
  switch (role) {
    case 'ops':
    case 'compliance':
    case 'finance':
    case 'management':
      return { list: true, view: true, export: true };
    default:
      return { list: false, view: false, export: false };
  }
}
