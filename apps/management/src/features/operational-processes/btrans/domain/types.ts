import type { IntegrationStatusFilter } from '@/features/operational-processes/shared/integration-types';
import type { BtransIntegrationRecord } from '@/mocks/btrans-integrations';
import type { BtransReportName } from './btrans-report-catalog';

export type BtransIntegrationRow = BtransIntegrationRecord;

export type BtransIntegrationDetail = BtransIntegrationRecord & {
  actionLog: import('@/features/operational-processes/shared/integration-types').IntegrationActionLog[];
};

export type BtransIntegrationFilters = {
  status: IntegrationStatusFilter;
  reportName: 'all' | BtransReportName;
  dateFrom: string;
  dateTo: string;
};

export type BtransPermissions = {
  list: boolean;
  view: boolean;
  retry: boolean;
  hold: boolean;
  cancel: boolean;
};
