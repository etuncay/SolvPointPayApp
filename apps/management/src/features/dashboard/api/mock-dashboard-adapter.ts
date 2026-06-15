import type { BackOfficeRole } from '@epay/ui';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { FAILED_LOGINS } from '@/mocks/data';
import { applyMutualExclusion } from '../domain/apply-mutual-exclusion';
import type {
  DashboardSnapshot,
  DashboardService,
  FailedLoginRow,
  WidgetCode,
  WidgetDataMap,
} from '../domain/types';
import {
  projectDailyVolume,
  projectNewCustomers30d,
  projectTopAgentsToday,
  projectTopCustomersToday,
} from '../projections/daily-metrics';
import { projectKycQueue } from '../projections/kyc-queue';
import { projectPendingApprovals } from '../projections/pending-approvals';
import { projectSysHealth } from '../projections/sys-health';
import {
  projectAmlHeldTransfers,
  projectPendingTransfers,
  projectRejectedTransfers,
} from '../projections/transfer-widgets';

const SIMULATE_ERROR_WIDGET: WidgetCode = 'sys_health';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildData(role: BackOfficeRole): WidgetDataMap {
  const user = getCurrentUser(role);
  const raw: WidgetDataMap = {
    my_approvals: projectPendingApprovals(user),
    pending_xfer: projectPendingTransfers(),
    kyc_manual: projectKycQueue(role),
    aml_held: projectAmlHeldTransfers(),
    rejected: projectRejectedTransfers(),
    daily_volume: projectDailyVolume(),
    new_customers: projectNewCustomers30d(),
    top_customers: projectTopCustomersToday(),
    top_agents: projectTopAgentsToday(),
    sys_health: projectSysHealth(),
  };
  return applyMutualExclusion(raw);
}

export const mockDashboardAdapter: DashboardService = {
  async getSnapshot(role: BackOfficeRole, refreshCount: number): Promise<DashboardSnapshot> {
    return mockDashboardAdapter.refreshAll(role, refreshCount);
  },

  async getWidget(role, code, refreshCount) {
    await delay(120);
    const refreshedAt = new Date();
    if (refreshCount > 0 && refreshCount % 3 === 0 && code === SIMULATE_ERROR_WIDGET) {
      return { refreshedAt, data: null, error: 'SERVICE_UNAVAILABLE' };
    }
    const data = buildData(role);
    return { refreshedAt, data: data[code] };
  },

  async refreshAll(role: BackOfficeRole, refreshCount: number): Promise<DashboardSnapshot> {
    await delay(350);
    const errors: Partial<Record<WidgetCode, string>> = {};
    if (refreshCount > 0 && refreshCount % 3 === 0) {
      errors[SIMULATE_ERROR_WIDGET] = 'SERVICE_UNAVAILABLE';
    }
    return {
      refreshedAt: new Date(),
      data: buildData(role),
      errors,
    };
  },

  async getFailedLogins(): Promise<FailedLoginRow[]> {
    await delay(120);
    return FAILED_LOGINS.map((r) => ({ ...r }));
  },
};
