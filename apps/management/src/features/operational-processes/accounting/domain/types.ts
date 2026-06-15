import type { IntegrationStatusFilter } from '@/features/operational-processes/shared/integration-types';
import type { AccountingIntegrationRecord } from '@/mocks/accounting-integrations';

export type AccountingIntegrationRow = AccountingIntegrationRecord & {
  senderDisplay: string;
  receiverDisplay: string;
  serviceOutputShort: string;
};

export type AccountingIntegrationDetail = AccountingIntegrationRecord & {
  actionLog: import('@/features/operational-processes/shared/integration-types').IntegrationActionLog[];
};

export type AccountingIntegrationFilters = {
  query: string;
  status: IntegrationStatusFilter;
};

export type AccountingPermissions = {
  list: boolean;
  view: boolean;
  retry: boolean;
  hold: boolean;
  cancel: boolean;
};
