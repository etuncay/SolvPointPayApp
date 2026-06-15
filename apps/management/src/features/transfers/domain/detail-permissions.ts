import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { TransactionDetailPermissions } from './detail-types';

/** Spec §3 — compliance/ops müdahale; finance salt okunur */
export function getTransactionDetailPermissions(
  role: BackOfficeRole,
  isManualReview = false,
): TransactionDetailPermissions {
  if (isAllAccessRole(role)) {
    return {
      view: true,
      hold: true,
      unblock: true,
      cancel: true,
      submitApproval: true,
      approveManual: true,
    };
  }
  switch (role) {
    case 'compliance':
    case 'ops':
    case 'management':
      return {
        view: true,
        hold: true,
        unblock: true,
        cancel: true,
        submitApproval: isManualReview,
        approveManual: isManualReview,
      };
    case 'finance':
      return {
        view: true,
        hold: false,
        unblock: false,
        cancel: false,
        submitApproval: false,
        approveManual: false,
      };
    default:
      return {
        view: false,
        hold: false,
        unblock: false,
        cancel: false,
        submitApproval: false,
        approveManual: false,
      };
  }
}
