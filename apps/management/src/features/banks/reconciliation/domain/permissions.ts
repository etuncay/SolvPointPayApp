import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { BankReconciliationPermissions } from './types';

/** Spec §3 + plan 6 ops görüntüleme — run yalnızca finance/management */
export function getBankReconciliationPermissions(
  role: BackOfficeRole,
): BankReconciliationPermissions {
  if (isAllAccessRole(role)) {
    return { list: true, view: true, run: true };
  }
  switch (role) {
    case 'finance':
    case 'management':
      return { list: true, view: true, run: true };
    case 'ops':
      return { list: true, view: true, run: false };
    default:
      return { list: false, view: false, run: false };
  }
}
