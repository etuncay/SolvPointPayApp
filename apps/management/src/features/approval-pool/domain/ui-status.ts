import type { ApprovalRequest, ApprovalUiStatus } from './types';

/** DB first/second status → önyüz status (§9) */
export function deriveUiStatus(r: Pick<
  ApprovalRequest,
  'requiredApprovals' | 'firstStatus' | 'secondStatus' | 'uiStatus'
>): ApprovalUiStatus {
  if (r.uiStatus === 'withdrawn' || r.uiStatus === 'superseded' || r.uiStatus === 'canceled') {
    return r.uiStatus;
  }

  const f = r.firstStatus;
  const s = r.secondStatus;

  if (f === 'Rejected') return 'rejected';
  if (f === 'Approved' && s === 'Rejected') return 'second_rejected';
  if (f === 'Approved' && (s === 'Approved' || r.requiredApprovals === 1)) {
    if (r.requiredApprovals === 1 && f === 'Approved') return 'approved';
    if (s === 'Approved') return 'approved';
  }
  if (f === 'Approved' && s === 'Pending') return 'awaiting_second';
  if (f === 'Pending') return 'awaiting_first';

  return r.uiStatus;
}
