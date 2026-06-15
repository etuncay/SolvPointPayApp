import { setAccountingIntegrationsPort } from './accounting-integrations-service';
import { mockAccountingIntegrationsAdapter } from './mock-accounting-integrations-adapter';

setAccountingIntegrationsPort(mockAccountingIntegrationsAdapter);

export { accountingIntegrationsService } from './accounting-integrations-service';
