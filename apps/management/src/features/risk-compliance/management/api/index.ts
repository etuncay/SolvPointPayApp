import { mockRiskManagementAdapter } from './mock-risk-management-adapter';
import { setRiskManagementPort } from './risk-management-service';

setRiskManagementPort(mockRiskManagementAdapter);

export { riskManagementService } from './risk-management-service';
