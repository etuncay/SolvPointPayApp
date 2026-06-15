import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { WalletPermissions } from './types';

/** Spec §3 — liste/export yetkileri */
export function getWalletPermissions(role: BackOfficeRole): WalletPermissions {
  if (isAllAccessRole(role)) {
    return { list: true, export: true, viewDetail: true };
  }
  switch (role) {
    case 'ops':
    case 'finance':
    case 'compliance':
    case 'management':
      return { list: true, export: true, viewDetail: true };
    default:
      return { list: false, export: false, viewDetail: false };
  }
}
