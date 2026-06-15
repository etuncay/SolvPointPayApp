import type { BackOfficeRole } from '@epay/ui';
import type {
  FraudRiskSource,
  ManualChangeInput,
  RiskScoreDetail,
  RiskScoresActionResult,
} from '../domain/types';

export type RiskScoresService = {
  getByEntityId(
    source: FraudRiskSource,
    entityId: string,
    role: BackOfficeRole,
  ): RiskScoreDetail | null;
  submitManualChange(
    source: FraudRiskSource,
    entityId: string,
    input: ManualChangeInput,
    role: BackOfficeRole,
  ): RiskScoresActionResult;
};

let port: RiskScoresService | null = null;

export function setRiskScoresPort(next: RiskScoresService): void {
  port = next;
}

export const riskScoresService: RiskScoresService = {
  getByEntityId(source, entityId, role) {
    if (!port) throw new Error('RiskScoresService port not configured');
    return port.getByEntityId(source, entityId, role);
  },
  submitManualChange(source, entityId, input, role) {
    if (!port) throw new Error('RiskScoresService port not configured');
    return port.submitManualChange(source, entityId, input, role);
  },
};
