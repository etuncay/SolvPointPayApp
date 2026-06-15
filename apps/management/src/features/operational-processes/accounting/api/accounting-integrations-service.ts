import type { BackOfficeRole } from '@epay/ui';
import type { IntegrationActionResult } from '@/features/operational-processes/shared/integration-types';
import type {
  AccountingIntegrationDetail,
  AccountingIntegrationFilters,
  AccountingIntegrationRow,
} from '../domain/types';

export type AccountingIntegrationsService = {
  list(filters: AccountingIntegrationFilters, role: BackOfficeRole): AccountingIntegrationRow[];
  getById(id: string, role: BackOfficeRole): AccountingIntegrationDetail | null;
  retry(id: string, role: BackOfficeRole): IntegrationActionResult;
  hold(id: string, role: BackOfficeRole): IntegrationActionResult;
  cancel(id: string, role: BackOfficeRole): IntegrationActionResult;
};

let port: AccountingIntegrationsService | null = null;

export function setAccountingIntegrationsPort(next: AccountingIntegrationsService): void {
  port = next;
}

export const accountingIntegrationsService: AccountingIntegrationsService = {
  list(filters, role) {
    if (!port) throw new Error('AccountingIntegrationsService port not configured');
    return port.list(filters, role);
  },
  getById(id, role) {
    if (!port) throw new Error('AccountingIntegrationsService port not configured');
    return port.getById(id, role);
  },
  retry(id, role) {
    if (!port) throw new Error('AccountingIntegrationsService port not configured');
    return port.retry(id, role);
  },
  hold(id, role) {
    if (!port) throw new Error('AccountingIntegrationsService port not configured');
    return port.hold(id, role);
  },
  cancel(id, role) {
    if (!port) throw new Error('AccountingIntegrationsService port not configured');
    return port.cancel(id, role);
  },
};
