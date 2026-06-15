import { mockRiskBasedLimitsAdapter } from './mock-risk-based-limits-adapter';
import { setRiskBasedLimitsPort } from './risk-based-limits-service';

setRiskBasedLimitsPort(mockRiskBasedLimitsAdapter);

export { riskBasedLimitsService } from './risk-based-limits-service';
export { mockRiskBasedLimitsAdapter } from './mock-risk-based-limits-adapter';
