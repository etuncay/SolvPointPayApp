import { mockRiskComplianceAdapter } from './mock-risk-compliance-adapter';
import { setRiskCompliancePort } from './risk-compliance-service';

setRiskCompliancePort(mockRiskComplianceAdapter);

export { riskComplianceService } from './risk-compliance-service';
export { mockRiskComplianceAdapter } from './mock-risk-compliance-adapter';
