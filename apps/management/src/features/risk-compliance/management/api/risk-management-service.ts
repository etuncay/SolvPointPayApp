import type { BackOfficeRole } from '@epay/ui';
import type {
  AssignableGroup,
  FraudEngineParams,
  GroupsPayload,
  ReferenceListCode,
  ReferenceListsPayload,
  RouteTargetResolution,
  RoutingRulesPayload,
  SaveResult,
} from '../domain/types';

export type RiskManagementService = {
  getReferenceLists(role: BackOfficeRole): ReferenceListsPayload;
  saveReferenceLists(payload: ReferenceListsPayload, role: BackOfficeRole): SaveResult;
  getGroups(role: BackOfficeRole): GroupsPayload;
  saveGroups(payload: GroupsPayload, role: BackOfficeRole): SaveResult;
  getRoutingRules(role: BackOfficeRole): RoutingRulesPayload;
  saveRoutingRules(payload: RoutingRulesPayload, role: BackOfficeRole): SaveResult;
  getParams(role: BackOfficeRole): FraudEngineParams;
  saveParams(params: FraudEngineParams, role: BackOfficeRole): SaveResult;
  listActiveReferenceValues(code: ReferenceListCode): string[];
  listAssignableGroups(role: BackOfficeRole): AssignableGroup[];
  getEngineTimeout(): number;
  isFraudChecksDisabled(): boolean;
  resolveRoutingTarget(
    ctx: { amount: number; channel: string; priority: string },
    role: BackOfficeRole,
  ): RouteTargetResolution | null;
};

let port: RiskManagementService | null = null;

export function setRiskManagementPort(next: RiskManagementService): void {
  port = next;
}

export const riskManagementService: RiskManagementService = {
  getReferenceLists(role) {
    if (!port) throw new Error('RiskManagementService port not configured');
    return port.getReferenceLists(role);
  },
  saveReferenceLists(payload, role) {
    if (!port) throw new Error('RiskManagementService port not configured');
    return port.saveReferenceLists(payload, role);
  },
  getGroups(role) {
    if (!port) throw new Error('RiskManagementService port not configured');
    return port.getGroups(role);
  },
  saveGroups(payload, role) {
    if (!port) throw new Error('RiskManagementService port not configured');
    return port.saveGroups(payload, role);
  },
  getRoutingRules(role) {
    if (!port) throw new Error('RiskManagementService port not configured');
    return port.getRoutingRules(role);
  },
  saveRoutingRules(payload, role) {
    if (!port) throw new Error('RiskManagementService port not configured');
    return port.saveRoutingRules(payload, role);
  },
  getParams(role) {
    if (!port) throw new Error('RiskManagementService port not configured');
    return port.getParams(role);
  },
  saveParams(params, role) {
    if (!port) throw new Error('RiskManagementService port not configured');
    return port.saveParams(params, role);
  },
  listActiveReferenceValues(code) {
    if (!port) throw new Error('RiskManagementService port not configured');
    return port.listActiveReferenceValues(code);
  },
  listAssignableGroups(role) {
    if (!port) throw new Error('RiskManagementService port not configured');
    return port.listAssignableGroups(role);
  },
  getEngineTimeout() {
    if (!port) throw new Error('RiskManagementService port not configured');
    return port.getEngineTimeout();
  },
  isFraudChecksDisabled() {
    if (!port) throw new Error('RiskManagementService port not configured');
    return port.isFraudChecksDisabled();
  },
  resolveRoutingTarget(ctx, role) {
    if (!port) throw new Error('RiskManagementService port not configured');
    return port.resolveRoutingTarget(ctx, role);
  },
};
