import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { BtransPermissions } from './types';

/** Spec §3 — finance / compliance / management */
export function getBtransPermissions(role: BackOfficeRole): BtransPermissions {
  if (isAllAccessRole(role)) {
    return { list: true, view: true, retry: true, hold: true, cancel: true };
  }
  if (role === 'finance' || role === 'compliance' || role === 'management') {
    return { list: true, view: true, retry: true, hold: true, cancel: true };
  }
  return { list: false, view: false, retry: false, hold: false, cancel: false };
}
