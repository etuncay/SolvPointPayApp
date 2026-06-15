import { setBtransIntegrationsPort } from './btrans-integrations-service';
import { mockBtransIntegrationsAdapter } from './mock-btrans-integrations-adapter';

setBtransIntegrationsPort(mockBtransIntegrationsAdapter);

export { btransIntegrationsService } from './btrans-integrations-service';
