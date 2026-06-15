import { mockFraudRulesAdapter } from './mock-fraud-rules-adapter';
import { setFraudRulesPort } from './fraud-rules-service';

setFraudRulesPort(mockFraudRulesAdapter);

export { fraudRulesService } from './fraud-rules-service';
