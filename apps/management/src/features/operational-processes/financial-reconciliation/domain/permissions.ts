import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { FinancialReconciliationPermissions } from './types';

/** Spec §3 — finance / management */
export function getFinancialReconciliationPermissions(
  role: BackOfficeRole,
): FinancialReconciliationPermissions {
  if (isAllAccessRole(role)) {
    return { list: true, view: true, run: true, adjust: true };
  }
  if (role === 'finance' || role === 'management') {
    return { list: true, view: true, run: true, adjust: true };
  }
  return { list: false, view: false, run: false, adjust: false };
}
