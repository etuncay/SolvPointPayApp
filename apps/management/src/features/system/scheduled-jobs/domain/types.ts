export type JobRecordStatus = 'Active' | 'Passive';
export type JobType = 'Once' | 'Recurring';
export type JobRunStatus = 'Running' | 'Success' | 'Failed' | 'Retrying';

export interface ScheduledJob {
  id: string;
  code: string;
  name: string;
  description: string;
  status: JobRecordStatus;
  jobType: JobType;
  cronExpression: string | null;
  owner: string;
  serviceUrl: string;
  dependencyIds: string[];
  maxRetry: number;
  retryIntervalSec: number;
  payload: string;
  feedbackEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledJobLog {
  id: string;
  jobId: string;
  jobStatus: JobRunStatus;
  startTime: string;
  endTime: string | null;
  attemptCount: number;
  serviceOutput: string;
  triggeredBy: string;
  triggeredByName: string;
  manualReason: string | null;
  nextRunAt: string | null;
}

export interface ScheduledJobListRow extends ScheduledJob {
  avgSuccessRate: number;
  avgDurationMs: number;
  avgAttemptCount: number;
  avgCpu: number;
  avgMemoryMb: number;
}

export interface JobPerformanceMetrics {
  successRate: number;
  avgDurationMs: number;
  avgAttemptCount: number;
  avgCpu: number;
  avgMemoryMb: number;
  totalRuns: number;
}

export interface JobFilters {
  query: string;
  status: 'any' | JobRecordStatus;
  jobType: 'any' | JobType;
}

export interface CreateJobInput {
  name: string;
  description: string;
  status: JobRecordStatus;
  jobType: JobType;
  cronExpression: string | null;
  owner: string;
  serviceUrl: string;
  dependencyIds: string[];
  maxRetry: number;
  retryIntervalSec: number;
  payload: string;
  feedbackEmail: string | null;
}

export type UpdateJobPayload = Partial<
  Omit<CreateJobInput, 'serviceUrl'> & { status: JobRecordStatus }
>;

export interface RunJobInput {
  scheduledAt?: string;
  feedbackEmail?: string;
  reason: string;
}

export interface JobRunContext {
  jobId: string;
  payload: unknown;
  triggeredBy: string;
  manualReason?: string;
}

export interface JobRunResult {
  ok: boolean;
  output: string;
}

export interface JobAuditEntry {
  at: string;
  jobId: string;
  action: 'create' | 'update' | 'run' | 'status_toggle';
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  reason?: string;
}
