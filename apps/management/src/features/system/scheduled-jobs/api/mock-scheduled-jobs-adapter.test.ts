import { describe, expect, it, beforeEach } from 'vitest';
import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import { resetScheduledJobLogs } from '@/mocks/scheduled-job-logs';
import { resetScheduledJobsStore } from '@/mocks/scheduled-jobs-store';
import {
  resetScheduledJobsAuditLog,
  scheduledJobsService,
} from './mock-scheduled-jobs-adapter';

describe('scheduledJobsService', () => {
  beforeEach(() => {
    resetScheduledJobsStore();
    resetScheduledJobLogs();
    resetScheduledJobsAuditLog();
  });

  it('seeds default jobs', () => {
    const rows = scheduledJobsService.list('management', {
      query: '',
      status: 'any',
      jobType: 'any',
    });
    expect(rows.length).toBeGreaterThanOrEqual(8);
  });

  it('rejects manual run without reason', async () => {
    const job = scheduledJobsService.list('management', {
      query: 'TCMB',
      status: 'any',
      jobType: 'any',
    })[0]!;
    const result = await scheduledJobsService.run(
      'management',
      MOCK_USER_IDS.management,
      'Admin',
      job.id,
      { reason: '   ' },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errorCode).toBe('sj_reason_required');
  });

  it('logs manual run with reason', async () => {
    const job = scheduledJobsService.list('management', {
      query: 'TCMB',
      status: 'any',
      jobType: 'any',
    })[0]!;
    const result = await scheduledJobsService.run(
      'management',
      MOCK_USER_IDS.management,
      'Admin',
      job.id,
      { reason: 'Acil rapor üretimi' },
    );
    expect(result.ok).toBe(true);
    const logs = scheduledJobsService.getLogs('management', job.id);
    expect(logs.some((l) => l.manualReason === 'Acil rapor üretimi')).toBe(true);
    const audit = scheduledJobsService.getAuditLog(job.id);
    expect(audit.some((e) => e.action === 'run' && e.reason === 'Acil rapor üretimi')).toBe(
      true,
    );
  });
});
