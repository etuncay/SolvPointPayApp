import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { CustomerNotePermissions } from './types';

/** Spec §3 — müşteri notları rol matrisi (yalnızca Operasyon ve Uyum) */
export function getCustomerNotePermissions(role: BackOfficeRole): CustomerNotePermissions {
  if (isAllAccessRole(role)) {
    return { list: true, insert: true, update: true, delete: true };
  }
  switch (role) {
    case 'ops':
    case 'compliance':
      return { list: true, insert: true, update: true, delete: true };
    default:
      return { list: true, insert: false, update: false, delete: false };
  }
}
