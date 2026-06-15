import { FAILED_LOGINS } from '@/mocks/data';
import type { DashboardService, FailedLoginRow } from '../domain/types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockDashboardAdapter: DashboardService = {
  async getFailedLogins(): Promise<FailedLoginRow[]> {
    await delay(120);
    return FAILED_LOGINS.map((r) => ({ ...r }));
  },
};
