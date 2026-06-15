import type {
  RiskBasedLimitRow,
  RiskLimitAuditEntry,
  RiskLimitsCurrentPayload,
} from '../domain/types';

export type RiskBasedLimitsPort = {
  getCurrent(): RiskLimitsCurrentPayload;
  getEffective(asOf: string): RiskLimitsCurrentPayload;
  saveVersion(rows: RiskBasedLimitRow[]): RiskLimitsCurrentPayload;
  getAuditLog(): RiskLimitAuditEntry[];
  resetForTests(): void;
};

let port: RiskBasedLimitsPort | null = null;

export function setRiskBasedLimitsPort(next: RiskBasedLimitsPort) {
  port = next;
}

function getPort(): RiskBasedLimitsPort {
  if (!port) throw new Error('RiskBasedLimitsPort not configured');
  return port;
}

export const riskBasedLimitsService = {
  getCurrent() {
    return getPort().getCurrent();
  },
  getEffective(asOf: string) {
    return getPort().getEffective(asOf);
  },
  saveVersion(rows: RiskBasedLimitRow[]) {
    return getPort().saveVersion(rows);
  },
  getAuditLog() {
    return getPort().getAuditLog();
  },
  resetForTests() {
    getPort().resetForTests();
  },
};
