import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { WalletDetailPermissions } from './detail-types';
import { canViewWalletCategory } from './role-visibility';

export { canViewWalletCategory } from './role-visibility';

/** Spec §3 — detay aksiyon matrisi */
export function getWalletDetailPermissions(role: BackOfficeRole): WalletDetailPermissions {
  if (isAllAccessRole(role)) {
    return { view: true, balanceBlock: true, addNote: true, editLimits: true };
  }
  switch (role) {
    case 'ops':
      return { view: true, balanceBlock: true, addNote: true, editLimits: true };
    case 'compliance':
      return { view: true, balanceBlock: true, addNote: true, editLimits: false };
    case 'finance':
      return { view: true, balanceBlock: false, addNote: true, editLimits: false };
    case 'management':
      return { view: true, balanceBlock: true, addNote: true, editLimits: true };
    default:
      return { view: false, balanceBlock: false, addNote: false, editLimits: false };
  }
}
