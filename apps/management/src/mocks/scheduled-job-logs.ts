import type { ScheduledJobLog } from '@/features/system/scheduled-jobs/domain/types';

let logs: ScheduledJobLog[] = [];
let nextLogId = 1;

export function resetScheduledJobLogs(): void {
  logs = [];
  nextLogId = 1;
}

export function getJobLogs(jobId?: string): ScheduledJobLog[] {
  const rows = jobId ? logs.filter((l) => l.jobId === jobId) : [...logs];
  return rows.sort((a, b) => b.startTime.localeCompare(a.startTime));
}

export function appendJobLog(
  entry: Omit<ScheduledJobLog, 'id'>,
): ScheduledJobLog {
  const row: ScheduledJobLog = {
    ...entry,
    id: `jlog-${String(nextLogId++).padStart(4, '0')}`,
  };
  logs = [row, ...logs];
  return row;
}

export function getLatestLogForJob(jobId: string): ScheduledJobLog | undefined {
  return getJobLogs(jobId)[0];
}
