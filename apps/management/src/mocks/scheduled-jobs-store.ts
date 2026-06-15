import {
  DEFAULT_SCHEDULED_JOBS,
  seedDefaultJobRow,
} from '@/features/system/scheduled-jobs/domain/default-jobs';
import type { ScheduledJob } from '@/features/system/scheduled-jobs/domain/types';

let store: ScheduledJob[] = DEFAULT_SCHEDULED_JOBS.map((d, i) => seedDefaultJobRow(d, i));
let nextId = store.length + 1;

export function resetScheduledJobsStore(): void {
  store = DEFAULT_SCHEDULED_JOBS.map((d, i) => seedDefaultJobRow(d, i));
  nextId = store.length + 1;
}

export function getScheduledJobsStore(): ScheduledJob[] {
  return store.map((j) => ({ ...j, dependencyIds: [...j.dependencyIds] }));
}

export function getScheduledJobById(id: string): ScheduledJob | undefined {
  const j = store.find((x) => x.id === id);
  return j ? { ...j, dependencyIds: [...j.dependencyIds] } : undefined;
}

export function appendScheduledJob(
  input: Omit<ScheduledJob, 'id' | 'createdAt' | 'updatedAt'>,
): ScheduledJob {
  const now = new Date('2026-05-25T10:00:00Z').toISOString();
  const job: ScheduledJob = {
    ...input,
    id: `job-${String(nextId++).padStart(3, '0')}`,
    createdAt: now,
    updatedAt: now,
  };
  store = [...store, job];
  return job;
}

export function updateScheduledJobRecord(
  id: string,
  patch: Partial<ScheduledJob>,
): ScheduledJob | undefined {
  const idx = store.findIndex((j) => j.id === id);
  if (idx < 0) return undefined;
  const now = new Date('2026-05-25T10:00:00Z').toISOString();
  const next = { ...store[idx]!, ...patch, updatedAt: now };
  store = [...store.slice(0, idx), next, ...store.slice(idx + 1)];
  return { ...next, dependencyIds: [...next.dependencyIds] };
}
