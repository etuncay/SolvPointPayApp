import type { CaseDecisionInput } from './types';

export function validateDecisionComment(
  input: CaseDecisionInput,
  requireManagerNote: boolean,
): { ok: true } | { ok: false; error: string } {
  if (!input.comment.trim()) {
    return { ok: false, error: 'fcd_comment_required' };
  }
  if (requireManagerNote && !input.managerNote?.trim()) {
    return { ok: false, error: 'fcd_manager_note_required' };
  }
  return { ok: true };
}

export function validateRouteInput(
  input: CaseDecisionInput & { targetUserId: string },
  requireManagerNote: boolean,
): { ok: true } | { ok: false; error: string } {
  const base = validateDecisionComment(input, requireManagerNote);
  if (!base.ok) return base;
  if (!input.targetUserId.trim()) {
    return { ok: false, error: 'fcd_route_target_required' };
  }
  return { ok: true };
}
