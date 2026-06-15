import { mockRiskScoresAdapter } from './mock-risk-scores-adapter';
import { setRiskScoresPort } from './risk-scores-service';

setRiskScoresPort(mockRiskScoresAdapter);

export { riskScoresService } from './risk-scores-service';
export {
  createRiskScoreApprovalRequest,
  applyRiskScoreApprovalIfNeeded,
  parseRiskScoreApprovalMeta,
} from './approval-bridge';
