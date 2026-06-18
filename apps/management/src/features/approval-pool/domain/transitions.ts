import { deriveUiStatus } from './ui-status';
import { userIdsMatch } from './current-user';
import type {
  ApprovalActionResult,
  ApprovalRequest,
  ApprovalStageStatus,
  CurrentUser,
} from './types';

function terminal(r: ApprovalRequest): boolean {
  return ['superseded', 'withdrawn', 'canceled', 'approved', 'rejected', 'second_rejected'].includes(
    r.uiStatus,
  );
}

/** 1. kademe onay bekliyor mu */
export function isAwaitingFirst(r: ApprovalRequest): boolean {
  return !terminal(r) && r.firstStatus === 'Pending';
}

/** 2. kademe onay bekliyor mu */
export function isAwaitingSecond(r: ApprovalRequest): boolean {
  return (
    !terminal(r) &&
    r.requiredApprovals === 2 &&
    r.firstStatus === 'Approved' &&
    r.secondStatus === 'Pending'
  );
}

export function canApprove(user: CurrentUser, r: ApprovalRequest): boolean {
  if (terminal(r) || r.uiStatus === 'withdrawn') return false;
  if (isAwaitingSecond(r)) return user.canSecondApprove;
  if (isAwaitingFirst(r)) return user.canFirstApprove;
  return false;
}

export function canReject(user: CurrentUser, r: ApprovalRequest): boolean {
  return canApprove(user, r);
}

export function canWithdraw(user: CurrentUser, r: ApprovalRequest): boolean {
  if (terminal(r)) return false;
  if (r.uiStatus === 'withdrawn') return false;
  return userIdsMatch(user.id, r.initiatedBy) && (r.firstStatus === 'Pending' || r.firstStatus === null);
}

function duplicateApproveError(r: ApprovalRequest, tier: 1 | 2): string | null {
  if (tier === 1 && r.firstStatus === 'Approved') return 'ap_duplicate_action';
  if (tier === 2 && r.secondStatus === 'Approved') return 'ap_duplicate_action';
  return null;
}

export function applyApprove(
  r: ApprovalRequest,
  user: CurrentUser,
  comment?: string,
  now = new Date().toISOString(),
): ApprovalActionResult & { record?: ApprovalRequest } {
  if (r.requiredApprovals === 1 && r.firstStatus === 'Approved') {
    return { ok: false, error: 'ap_duplicate_action' };
  }
  if (r.requiredApprovals === 2 && r.secondStatus === 'Approved') {
    return { ok: false, error: 'ap_duplicate_action' };
  }
  if (
    r.requiredApprovals === 2 &&
    r.firstStatus === 'Approved' &&
    r.secondStatus === 'Pending' &&
    user.canFirstApprove
  ) {
    return { ok: false, error: 'ap_duplicate_action' };
  }

  if (!canApprove(user, r)) {
    if (user.canSecondApprove && isAwaitingFirst(r)) return { ok: false, error: 'ap_second_before_first' };
    return { ok: false, error: 'fx_forbidden' };
  }

  // §0.5 — 1. ve 2. onaycı farklı kişiler olmak zorundadır.
  if (isAwaitingSecond(r) && r.firstApprover && userIdsMatch(user.id, r.firstApprover)) {
    return { ok: false, error: 'ap_same_approver' };
  }

  if (isAwaitingSecond(r)) {
    const dup = duplicateApproveError(r, 2);
    if (dup) return { ok: false, error: dup };
    const next: ApprovalRequest = {
      ...r,
      secondStatus: 'Approved',
      secondApprovalAt: now,
      secondApprover: user.id,
      secondApproverName: user.displayName,
      comment: comment?.trim() || r.comment,
      lastActionBy: user.id,
    };
    next.uiStatus = deriveUiStatus(next);
    return { ok: true, id: r.id, record: next };
  }

  if (isAwaitingFirst(r)) {
    const dup = duplicateApproveError(r, 1);
    if (dup) return { ok: false, error: dup };

    const secondStatus: ApprovalStageStatus | null =
      r.requiredApprovals === 2 ? 'Pending' : null;

    const next: ApprovalRequest = {
      ...r,
      firstStatus: 'Approved',
      firstApprovalAt: now,
      firstApprover: user.id,
      firstApproverName: user.displayName,
      secondStatus,
      secondApprover: r.requiredApprovals === 2 ? r.secondApprover : null,
      secondApproverName: r.requiredApprovals === 2 ? r.secondApproverName : null,
      comment: comment?.trim() || r.comment,
      lastActionBy: user.id,
    };
    next.uiStatus = deriveUiStatus(next);
    return { ok: true, id: r.id, record: next };
  }

  return { ok: false, error: 'ap_duplicate_action' };
}

export function applyReject(
  r: ApprovalRequest,
  user: CurrentUser,
  comment: string,
  now = new Date().toISOString(),
): ApprovalActionResult & { record?: ApprovalRequest } {
  if (!comment.trim()) return { ok: false, error: 'ap_reject_comment_required' };
  if (!canReject(user, r)) {
    if (user.canSecondApprove && isAwaitingFirst(r)) return { ok: false, error: 'ap_second_before_first' };
    return { ok: false, error: 'fx_forbidden' };
  }

  if (isAwaitingSecond(r)) {
    const next: ApprovalRequest = {
      ...r,
      secondStatus: 'Rejected',
      secondApprovalAt: now,
      secondApprover: user.id,
      secondApproverName: user.displayName,
      comment: comment.trim(),
      lastActionBy: user.id,
    };
    next.uiStatus = deriveUiStatus(next);
    return { ok: true, id: r.id, record: next };
  }

  if (isAwaitingFirst(r)) {
    const next: ApprovalRequest = {
      ...r,
      firstStatus: 'Rejected',
      firstApprovalAt: now,
      firstApprover: user.id,
      firstApproverName: user.displayName,
      comment: comment.trim(),
      lastActionBy: user.id,
    };
    next.uiStatus = deriveUiStatus(next);
    return { ok: true, id: r.id, record: next };
  }

  return { ok: false, error: 'ap_duplicate_action' };
}

export function applyWithdraw(
  r: ApprovalRequest,
  user: CurrentUser,
): ApprovalActionResult & { record?: ApprovalRequest } {
  if (!canWithdraw(user, r)) return { ok: false, error: 'fx_forbidden' };
  const next: ApprovalRequest = {
    ...r,
    uiStatus: 'withdrawn',
    lastActionBy: user.id,
  };
  return { ok: true, id: r.id, record: next };
}
