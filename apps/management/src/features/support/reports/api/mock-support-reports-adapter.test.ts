import { describe, expect, it, beforeEach } from 'vitest';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { supportReportsService } from './mock-support-reports-adapter';

describe('mock-support-reports-adapter', () => {
  beforeEach(() => supportReportsService.resetForTests());

  it('management sees all panels ok', async () => {
    const user = getCurrentUser('management');
    const bundle = await supportReportsService.getAll('management', user.id);
    expect(bundle.panels['by-complaint-type']?.ok).toBe(true);
    expect(bundle.panels['by-case-age']?.ok).toBe(true);
    expect(bundle.panels['customers-by-cases']?.ok).toBe(true);
    expect(bundle.panels['agents-by-cases']?.ok).toBe(true);
  });

  it('ops forbidden', async () => {
    const user = getCurrentUser('ops');
    await expect(supportReportsService.getAll('ops', user.id)).rejects.toThrow('scr_forbidden');
  });

  it('panel error isolation', async () => {
    const user = getCurrentUser('management');
    supportReportsService.setSimulateError('customers-by-cases');
    const bundle = await supportReportsService.getAll('management', user.id, {
      simulateError: 'customers-by-cases',
    });
    expect(bundle.panels['customers-by-cases']?.ok).toBe(false);
    expect(bundle.panels['by-case-age']?.ok).toBe(true);
  });
});
