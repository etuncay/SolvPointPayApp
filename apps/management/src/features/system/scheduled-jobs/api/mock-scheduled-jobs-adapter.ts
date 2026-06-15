import type { BackOfficeRole } from '@epay/ui';
import { sendTemplate } from '@/features/system/notifications';
import { userDisplayNameById } from '@/mocks/app-users';
import {
  appendJobLog,
  getJobLogs,
  getLatestLogForJob,
  resetScheduledJobLogs,
} from '@/mocks/scheduled-job-logs';
import {
  appendScheduledJob,
  getScheduledJobById,
  getScheduledJobsStore,
  updateScheduledJobRecord,
} from '@/mocks/scheduled-jobs-store';
import { validateCronForJobType } from '../domain/cron-validation';
import { wouldCreateCycle } from '../domain/dependency-graph';
import { executeJobByServiceUrl } from '../domain/job-handler-registry';
import { aggregateJobLogs } from '../domain/log-aggregates';
import { canAccessScheduledJobs, canMutateScheduledJobs } from '../domain/permissions';
import {
  validateJobName,
  validateManualRunReason,
  validateMaxRetry,
  validatePayloadJson,
} from '../domain/validation';
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
import type { ScheduledJobsService } from './scheduled-jobs-service';

let auditLog: JobAuditEntry[] = [];

function audit(entry: Omit<JobAuditEntry, 'at'>) {
  auditLog = [{ at: new Date('2026-05-25T10:00:00Z').toISOString(), ...entry }, ...auditLog];
}

export function resetScheduledJobsAuditLog(): void {
  auditLog = [];
}

function listRows(): ScheduledJobListRow[] {
  const allLogs = getJobLogs();
  return getScheduledJobsStore().map((job) => {
    const m = aggregateJobLogs(allLogs, job.id);
    return {
      ...job,
      avgSuccessRate: m.successRate,
      avgDurationMs: m.avgDurationMs,
      avgAttemptCount: m.avgAttemptCount,
      avgCpu: m.avgCpu,
      avgMemoryMb: m.avgMemoryMb,
    };
  });
}

function dependenciesMet(job: ScheduledJob): boolean {
  for (const depId of job.dependencyIds) {
    const last = getLatestLogForJob(depId);
    if (!last || last.jobStatus !== 'Success') return false;
  }
  return true;
}

async function executeWithRetry(
  job: ScheduledJob,
  triggeredBy: string,
  triggeredByName: string,
  manualReason: string | null,
  feedbackEmail?: string,
): Promise<ScheduledJobLog[]> {
  const start = new Date('2026-05-25T10:00:00Z').toISOString();
  const created: ScheduledJobLog[] = [];
  let attempt = 1;
  let simulateFail = job.code === 'sanction_screening_monthly' && !manualReason;

  while (attempt <= job.maxRetry) {
    if (attempt > 1) {
      created.push(
        appendJobLog({
          jobId: job.id,
          jobStatus: 'Retrying',
          startTime: start,
          endTime: null,
          attemptCount: attempt,
          serviceOutput: '',
          triggeredBy,
          triggeredByName,
          manualReason,
          nextRunAt: null,
        }),
      );
    }

    if (simulateFail) {
      created.push(
        appendJobLog({
          jobId: job.id,
          jobStatus: 'Failed',
          startTime: start,
          endTime: new Date('2026-05-25T10:00:05Z').toISOString(),
          attemptCount: attempt,
          serviceOutput: 'Simulated failure (mock retry)',
          triggeredBy,
          triggeredByName,
          manualReason,
          nextRunAt: null,
        }),
      );
      attempt += 1;
      simulateFail = false;
      continue;
    }

    const result = await executeJobByServiceUrl(job.serviceUrl, {
      jobId: job.id,
      payload: job.payload,
      triggeredBy,
      manualReason: manualReason ?? undefined,
    });
    let output = result.output;
    if (feedbackEmail) {
      void sendTemplate({
        templateIdOrName: 'job_result',
        recipientAddress: feedbackEmail,
        params: { is_adi: job.name, link: output.slice(0, 120) },
        triggeredBy,
      }).catch(() => undefined);
      output += `\n[notification] job_result → ${feedbackEmail}`;
    }
    created.push(
      appendJobLog({
        jobId: job.id,
        jobStatus: result.ok ? 'Success' : 'Failed',
        startTime: start,
        endTime: new Date('2026-05-25T10:00:08Z').toISOString(),
        attemptCount: attempt,
        serviceOutput: output,
        triggeredBy,
        triggeredByName,
        manualReason,
        nextRunAt: job.cronExpression
          ? new Date('2026-05-26T08:00:00Z').toISOString()
          : null,
      }),
    );
    break;
  }

  return created;
}

export const scheduledJobsService: ScheduledJobsService = {
  list(role, filters) {
    if (!canAccessScheduledJobs(role)) return [];
    let rows = listRows();
    if (filters.status !== 'any') {
      rows = rows.filter((r) => r.status === filters.status);
    }
    if (filters.jobType !== 'any') {
      rows = rows.filter((r) => r.jobType === filters.jobType);
    }
    if (filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.owner.toLowerCase().includes(q),
      );
    }
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  },

  getById(role, jobId) {
    if (!canAccessScheduledJobs(role)) return null;
    return getScheduledJobById(jobId) ?? null;
  },

  create(role, userId, input: CreateJobInput) {
    if (!canMutateScheduledJobs(role)) return { ok: false, errorCode: 'sj_forbidden' };
    const nameErr = validateJobName(input.name);
    if (nameErr) return { ok: false, errorCode: nameErr };
    const cronErr = validateCronForJobType(input.jobType, input.cronExpression);
    if (cronErr) return { ok: false, errorCode: cronErr };
    const retryErr = validateMaxRetry(input.maxRetry);
    if (retryErr) return { ok: false, errorCode: retryErr };
    const payloadErr = validatePayloadJson(input.payload);
    if (payloadErr) return { ok: false, errorCode: payloadErr };
    const jobs = getScheduledJobsStore();
    const tempId = '__new__';
    if (wouldCreateCycle(jobs, tempId, input.dependencyIds)) {
      return { ok: false, errorCode: 'sj_cycle_detected' };
    }
    const code = input.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    const job = appendScheduledJob({ ...input, code: code || 'custom_job' });
    audit({ jobId: job.id, action: 'create', userId });
    return { ok: true, job };
  },

  update(role, userId, jobId, payload: UpdateJobPayload) {
    if (!canMutateScheduledJobs(role)) return { ok: false, errorCode: 'sj_forbidden' };
    const before = getScheduledJobById(jobId);
    if (!before) return { ok: false, errorCode: 'sj_not_found' };

    const jobType = payload.jobType ?? before.jobType;
    const cronExpression =
      payload.cronExpression !== undefined ? payload.cronExpression : before.cronExpression;
    const cronErr = validateCronForJobType(jobType, cronExpression);
    if (cronErr) return { ok: false, errorCode: cronErr };

    if (payload.maxRetry != null) {
      const retryErr = validateMaxRetry(payload.maxRetry);
      if (retryErr) return { ok: false, errorCode: retryErr };
    }
    if (payload.payload != null) {
      const payloadErr = validatePayloadJson(payload.payload);
      if (payloadErr) return { ok: false, errorCode: payloadErr };
    }
    const deps = payload.dependencyIds ?? before.dependencyIds;
    if (wouldCreateCycle(getScheduledJobsStore(), jobId, deps)) {
      return { ok: false, errorCode: 'sj_cycle_detected' };
    }

    const updated = updateScheduledJobRecord(jobId, { ...payload, dependencyIds: deps });
    if (!updated) return { ok: false, errorCode: 'sj_not_found' };
    audit({ jobId, action: 'update', userId, field: 'definition' });
    return { ok: true, job: updated };
  },

  toggleStatus(role, userId, jobId) {
    if (!canMutateScheduledJobs(role)) return { ok: false, errorCode: 'sj_forbidden' };
    const job = getScheduledJobById(jobId);
    if (!job) return { ok: false, errorCode: 'sj_not_found' };
    const next = job.status === 'Active' ? 'Passive' : 'Active';
    const updated = updateScheduledJobRecord(jobId, { status: next });
    if (!updated) return { ok: false, errorCode: 'sj_not_found' };
    audit({
      jobId,
      action: 'status_toggle',
      userId,
      oldValue: job.status,
      newValue: next,
    });
    return { ok: true, job: updated };
  },

  async run(role, userId, userName, jobId, input: RunJobInput) {
    if (!canMutateScheduledJobs(role)) return { ok: false, errorCode: 'sj_forbidden' };
    const reasonErr = validateManualRunReason(input.reason);
    if (reasonErr) return { ok: false, errorCode: reasonErr };
    const job = getScheduledJobById(jobId);
    if (!job) return { ok: false, errorCode: 'sj_not_found' };
    if (job.status !== 'Active') return { ok: false, errorCode: 'sj_job_passive' };
    if (!dependenciesMet(job)) return { ok: false, errorCode: 'sj_deps_not_ready' };

    audit({ jobId, action: 'run', userId, reason: input.reason.trim() });
    const logs = await executeWithRetry(
      job,
      userId,
      userName,
      input.reason.trim(),
      input.feedbackEmail ?? job.feedbackEmail ?? undefined,
    );
    return { ok: true, logs };
  },

  getLogs(role, jobId) {
    if (!canAccessScheduledJobs(role)) return [];
    return getJobLogs(jobId);
  },

  getPerformance(role, jobId) {
    if (!canAccessScheduledJobs(role)) {
      return {
        successRate: 0,
        avgDurationMs: 0,
        avgAttemptCount: 0,
        avgCpu: 0,
        avgMemoryMb: 0,
        totalRuns: 0,
      };
    }
    return aggregateJobLogs(getJobLogs(), jobId);
  },

  getAuditLog(jobId) {
    if (jobId) return auditLog.filter((e) => e.jobId === jobId);
    return [...auditLog];
  },
};

