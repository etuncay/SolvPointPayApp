import type { JobRunStatus } from './types';

const TONE: Record<JobRunStatus, 'success' | 'danger' | 'warning' | 'neutral'> = {
  Success: 'success',
  Failed: 'danger',
  Running: 'warning',
  Retrying: 'neutral',
};

export function jobRunStatusTone(status: JobRunStatus): 'success' | 'danger' | 'warning' | 'neutral' {
  return TONE[status];
}

export function jobRunStatusI18nKey(status: JobRunStatus): string {
  return `sj_run_${status}`;
}
