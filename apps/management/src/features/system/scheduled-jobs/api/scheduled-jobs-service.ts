import type { BackOfficeRole } from '@epay/ui';
import type {
  CreateJobInput,
  JobAuditEntry,
  JobFilters,
  JobPerformanceMetrics,
  RunJobInput,
  ScheduledJob,
  ScheduledJobListRow,
  ScheduledJobLog,
  UpdateJobPayload,
} from '../domain/types';

export type ScheduledJobsService = {
  list(role: BackOfficeRole, filters: JobFilters): ScheduledJobListRow[];
  getById(role: BackOfficeRole, jobId: string): ScheduledJob | null;
  create(
    role: BackOfficeRole,
    userId: string,
    input: CreateJobInput,
  ): { ok: true; job: ScheduledJob } | { ok: false; errorCode: string };
  update(
    role: BackOfficeRole,
    userId: string,
    jobId: string,
    payload: UpdateJobPayload,
  ): { ok: true; job: ScheduledJob } | { ok: false; errorCode: string };
  toggleStatus(
    role: BackOfficeRole,
    userId: string,
    jobId: string,
  ): { ok: true; job: ScheduledJob } | { ok: false; errorCode: string };
  run(
    role: BackOfficeRole,
    userId: string,
    userName: string,
    jobId: string,
    input: RunJobInput,
  ): Promise<{ ok: true; logs: ScheduledJobLog[] } | { ok: false; errorCode: string }>;
  getLogs(role: BackOfficeRole, jobId: string): ScheduledJobLog[];
  getPerformance(role: BackOfficeRole, jobId: string): JobPerformanceMetrics;
  getAuditLog(jobId?: string): JobAuditEntry[];
};
