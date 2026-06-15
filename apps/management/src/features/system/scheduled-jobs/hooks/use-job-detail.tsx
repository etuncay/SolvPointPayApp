import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { scheduledJobsService } from '../api/mock-scheduled-jobs-adapter';
import type { CreateJobInput, JobRecordStatus, JobType, ScheduledJob, UpdateJobPayload } from '../domain/types';

export function useJobDetail(role: BackOfficeRole, jobId: string | undefined) {
  const [job, setJob] = useState<ScheduledJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<UpdateJobPayload>({});
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => {
    if (!jobId) {
      setJob(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const j = scheduledJobsService.getById(role, jobId);
    setJob(j);
    if (j) {
      setDraft({
        name: j.name,
        description: j.description,
        status: j.status,
        jobType: j.jobType,
        cronExpression: j.cronExpression,
        owner: j.owner,
        dependencyIds: [...j.dependencyIds],
        maxRetry: j.maxRetry,
        retryIntervalSec: j.retryIntervalSec,
        payload: j.payload,
        feedbackEmail: j.feedbackEmail,
      });
    }
    setLoading(false);
  }, [role, jobId, tick]);

  useEffect(() => {
    reload();
  }, [reload]);

  const dirty = useMemo(() => {
    if (!job) return false;
    return JSON.stringify(draft) !== JSON.stringify({
      name: job.name,
      description: job.description,
      status: job.status,
      jobType: job.jobType,
      cronExpression: job.cronExpression,
      owner: job.owner,
      dependencyIds: job.dependencyIds,
      maxRetry: job.maxRetry,
      retryIntervalSec: job.retryIntervalSec,
      payload: job.payload,
      feedbackEmail: job.feedbackEmail,
    });
  }, [job, draft]);

  const save = useCallback(async () => {
    if (!jobId) return { ok: false as const, errorCode: 'sj_not_found' };
    const result = scheduledJobsService.update(role, 'mgmt-user', jobId, draft);
    if (result.ok) setTick((n) => n + 1);
    return result;
  }, [role, jobId, draft]);

  const toggleStatus = useCallback(async () => {
    if (!jobId) return { ok: false as const, errorCode: 'sj_not_found' };
    const result = scheduledJobsService.toggleStatus(role, 'mgmt-user', jobId);
    if (result.ok) setTick((n) => n + 1);
    return result;
  }, [role, jobId]);

  const patchDraft = useCallback((patch: Partial<UpdateJobPayload>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const setJobType = useCallback((jobType: JobType) => {
    setDraft((d) => ({
      ...d,
      jobType,
      cronExpression: jobType === 'Once' ? null : d.cronExpression ?? '0 8 * * *',
    }));
  }, []);

  const setStatus = useCallback((status: JobRecordStatus) => {
    setDraft((d) => ({ ...d, status }));
  }, []);

  return {
    job,
    draft,
    loading,
    dirty,
    patchDraft,
    setJobType,
    setStatus,
    save,
    toggleStatus,
    bump: () => setTick((n) => n + 1),
    logs: jobId ? scheduledJobsService.getLogs(role, jobId) : [],
    performance: jobId ? scheduledJobsService.getPerformance(role, jobId) : null,
    allJobs: scheduledJobsService.list(role, { query: '', status: 'any', jobType: 'any' }),
  };
}

export function useJobCreateDefaults(): CreateJobInput {
  return {
    name: '',
    description: '',
    status: 'Active',
    jobType: 'Recurring',
    cronExpression: '0 8 * * *',
    owner: 'Sistem',
    serviceUrl: 'internal://agent-reconciliation-email',
    dependencyIds: [],
    maxRetry: 3,
    retryIntervalSec: 60,
    payload: '{}',
    feedbackEmail: null,
  };
}
