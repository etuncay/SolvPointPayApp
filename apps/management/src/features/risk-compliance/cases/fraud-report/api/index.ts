import { mockFraudRecordsAdapter } from './mock-fraud-records-adapter';
import { setFraudRecordsPort } from './fraud-records-service';

setFraudRecordsPort(mockFraudRecordsAdapter);

export { fraudRecordsService } from './fraud-records-service';
