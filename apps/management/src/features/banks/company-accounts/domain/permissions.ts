import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { CompanyBankAccountPermissions } from './types';

/** Spec §3 — finance / management (muhasebe eşdeğeri) */
export function getCompanyBankAccountPermissions(role: BackOfficeRole): CompanyBankAccountPermissions {
  if (isAllAccessRole(role)) {
    return {
      list: true,
      insert: true,
      update: true,
      deactivate: true,
      fetchBalance: true,
      export: true,
    };
  }
  switch (role) {
    case 'finance':
    case 'management':
      return {
        list: true,
        insert: true,
        update: true,
        deactivate: true,
        fetchBalance: true,
        export: true,
      };
    default:
      return {
        list: false,
        insert: false,
        update: false,
        deactivate: false,
        fetchBalance: false,
        export: false,
      };
  }
}
