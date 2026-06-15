import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { WalletActivityPermissions } from './activity-types';

/** Spec §3 — 4.1 ile aynı rol matrisi */
export function getWalletActivityPermissions(role: BackOfficeRole): WalletActivityPermissions {
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
