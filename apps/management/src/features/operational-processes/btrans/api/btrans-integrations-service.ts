import type { BackOfficeRole } from '@epay/ui';
import type { IntegrationActionResult } from '@/features/operational-processes/shared/integration-types';
import type {
  BtransIntegrationDetail,
  BtransIntegrationFilters,
  BtransIntegrationRow,
} from '../domain/types';

export type BtransIntegrationsService = {
  list(filters: BtransIntegrationFilters, role: BackOfficeRole): BtransIntegrationRow[];
  getById(id: string, role: BackOfficeRole): BtransIntegrationDetail | null;
  retry(id: string, role: BackOfficeRole): IntegrationActionResult;
  hold(id: string, role: BackOfficeRole): IntegrationActionResult;
  cancel(id: string, role: BackOfficeRole): IntegrationActionResult;
};

let port: BtransIntegrationsService | null = null;

export function setBtransIntegrationsPort(next: BtransIntegrationsService): void {
  port = next;
}

export const btransIntegrationsService: BtransIntegrationsService = {
  list(filters, role) {
    if (!port) throw new Error('BtransIntegrationsService port not configured');
    return port.list(filters, role);
  },
  getById(id, role) {
    if (!port) throw new Error('BtransIntegrationsService port not configured');
    return port.getById(id, role);
  },
  retry(id, role) {
    if (!port) throw new Error('BtransIntegrationsService port not configured');
    return port.retry(id, role);
  },
  hold(id, role) {
    if (!port) throw new Error('BtransIntegrationsService port not configured');
    return port.hold(id, role);
  },
  cancel(id, role) {
    if (!port) throw new Error('BtransIntegrationsService port not configured');
    return port.cancel(id, role);
  },
};
