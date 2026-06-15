import { describe, expect, it } from 'vitest';
import { executeJobByServiceUrl } from './job-handler-registry';

describe('job-handler-registry', () => {
  it('runs tcmb daily handler', async () => {
    const result = await executeJobByServiceUrl('internal://tcmb-daily-reports', {
      jobId: 'job-008',
      payload: { reportDate: '2026-05-24' },
      triggeredBy: 'test',
    });
    expect(result.ok).toBe(true);
    expect(result.output).toContain('reportDate');
  });
});
