import type { DashboardService } from '../domain/types';
import { mockDashboardAdapter } from './mock-dashboard-adapter';

/** Gerçek API bağlandığında burada adapter değiştirilir. */
export const dashboardService: DashboardService = mockDashboardAdapter;
