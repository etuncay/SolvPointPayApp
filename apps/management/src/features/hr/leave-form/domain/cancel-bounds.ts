export type CancelBoundsErrorCode =
  | 'lf_cancel_start_before'
  | 'lf_cancel_end_after'
  | 'lf_cancel_no_change'
  | 'lf_date_range_invalid';

export function validateCancelDates(
  original: { start: string; end: string },
  proposed: { start: string; end: string },
  fullCancel: boolean,
): { ok: true } | { ok: false; code: CancelBoundsErrorCode } {
  if (!proposed.start || !proposed.end) {
    return { ok: false, code: 'lf_date_range_invalid' };
  }
  if (fullCancel) return { ok: true };
  if (proposed.start < original.start) return { ok: false, code: 'lf_cancel_start_before' };
  if (proposed.end > original.end) return { ok: false, code: 'lf_cancel_end_after' };
  if (proposed.start === original.start && proposed.end === original.end) {
    return { ok: false, code: 'lf_cancel_no_change' };
  }
  if (proposed.start > proposed.end) return { ok: false, code: 'lf_date_range_invalid' };
  return { ok: true };
}
