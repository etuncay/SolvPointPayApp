import { mockRiskScoreRulesAdapter } from './mock-risk-score-rules-adapter';
import { setRiskScoreRulesPort } from './risk-score-rules-service';

setRiskScoreRulesPort(mockRiskScoreRulesAdapter);

export { riskScoreRulesService } from './risk-score-rules-service';
export { mockRiskScoreRulesAdapter } from './mock-risk-score-rules-adapter';
