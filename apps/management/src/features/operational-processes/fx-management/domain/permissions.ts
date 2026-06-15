import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { FxPermissions } from './types';

/** Spec §3 — finance / management */
export function getFxPermissions(role: BackOfficeRole): FxPermissions {
  if (isAllAccessRole(role)) {
    return { view: true, editMargins: true, refreshRates: true };
  }
  if (role === 'finance' || role === 'management') {
    return { view: true, editMargins: true, refreshRates: true };
  }
  return { view: false, editMargins: false, refreshRates: false };
}
