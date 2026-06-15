import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { AccountingPermissions } from './types';

/** Spec §3 — finance / management */
export function getAccountingPermissions(role: BackOfficeRole): AccountingPermissions {
  if (isAllAccessRole(role)) {
    return { list: true, view: true, retry: true, hold: true, cancel: true };
  }
  if (role === 'finance' || role === 'management') {
    return { list: true, view: true, retry: true, hold: true, cancel: true };
  }
  return { list: false, view: false, retry: false, hold: false, cancel: false };
}
