import type { JobType } from './types';

/** Tekrarlı işlerde cron zorunlu; basit 5/6 alanlı ifade kontrolü */
export function isValidCronExpression(expr: string): boolean {
  const parts = expr.trim().split(/\s+/);
  if (parts.length < 5 || parts.length > 6) return false;
  return parts.every((p) => /^[\d*,/-]+$/.test(p) || p === '?');
}

export function validateCronForJobType(
  jobType: JobType,
  cronExpression: string | null,
): string | null {
  if (jobType !== 'Recurring') return null;
  const cron = cronExpression?.trim() ?? '';
  if (!cron) return 'sj_cron_required';
  if (!isValidCronExpression(cron)) return 'sj_cron_invalid';
  return null;
}
