import { mockFraudCasesAdapter } from './mock-fraud-cases-adapter';
import { setFraudCasesPort } from './fraud-cases-service';
import '../fraud-report/api';

setFraudCasesPort(mockFraudCasesAdapter);

export { fraudCasesService } from './fraud-cases-service';
export { findCaseByTransactionId } from './mock-fraud-cases-adapter';
