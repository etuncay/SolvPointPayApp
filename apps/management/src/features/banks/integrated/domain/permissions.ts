import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { IntegratedBankPermissions } from './types';

/** Spec §3 — yalnızca finance / management */
export function getIntegratedBankPermissions(role: BackOfficeRole): IntegratedBankPermissions {
  if (isAllAccessRole(role)) {
    return { list: true, insert: true, update: true, deactivate: true, export: true };
  }
  switch (role) {
    case 'finance':
    case 'management':
      return { list: true, insert: true, update: true, deactivate: true, export: true };
    default:
      return { list: false, insert: false, update: false, deactivate: false, export: false };
  }
}
