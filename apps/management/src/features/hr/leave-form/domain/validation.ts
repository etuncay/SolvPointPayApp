import { validateCancelDates } from './cancel-bounds';
import type { LeaveFormMode, LeaveFormValues } from './types';

export function validateLeaveForm(
  mode: LeaveFormMode,
  values: LeaveFormValues,
  original?: { start: string; end: string },
): string | null {
  if (!values.startDate || !values.endDate) return 'lf_date_range_invalid';
  if (values.startDate > values.endDate && !values.cancelFull) return 'lf_date_range_invalid';

  if (mode === 'cancel' && original) {
    const bounds = validateCancelDates(
      original,
      { start: values.startDate, end: values.endDate },
      values.cancelFull,
    );
    if (!bounds.ok) return bounds.code;
  }

  if (mode === 'create' && values.startDate > values.endDate) return 'lf_date_range_invalid';
  return null;
}
