import type { BackOfficeRole } from '@epay/ui';
import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { computeChangedFields } from '@/features/approval-pool/domain/compute-changed-fields';
import { resolveRequiredApprovals } from '@/features/approval-pool/domain/resolve-required-approvals';
import type { ApprovalRequest, PayloadChange } from '@/features/approval-pool/domain/types';
import type {
  CaseGroup,
  CaseRoutingRule,
  FraudEngineParams,
  OccupationThreshold,
  ReferenceListItem,
} from '../domain/types';

export type RiskManagementApprovalPayload = {
  refPayload: { items: ReferenceListItem[]; occupationThresholds: OccupationThreshold[] };
  groups: CaseGroup[];
  rules: CaseRoutingRule[];
  params: FraudEngineParams;
};

export type RiskManagementApprovalMeta = {
  payload: RiskManagementApprovalPayload;
  role: BackOfficeRole;
};

function snapshotToValues(payload: RiskManagementApprovalPayload): Record<string, unknown> {
  return {
    params: JSON.stringify(payload.params),
    groupsCount: payload.groups.length,
    rulesCount: payload.rules.length,
    refItemsCount: payload.refPayload.items.filter((i) => !i.effectiveTo).length,
    occupationCount: payload.refPayload.occupationThresholds.length,
  };
}

function buildRiskChanges(newValues: Record<string, unknown>, oldValues: Record<string, unknown>): PayloadChange[] {
  return computeChangedFields(newValues, oldValues).map((field) => ({
    field,
    label: field,
    oldValue: String(oldValues[field] ?? '—'),
    newValue: String(newValues[field] ?? '—'),
  }));
}

export function createRiskManagementApprovalRequest(
  input: { payload: RiskManagementApprovalPayload; oldSnapshot: RiskManagementApprovalPayload; role: BackOfficeRole },
): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(input.role);
  const newValues = snapshotToValues(input.payload);
  const oldValues = snapshotToValues(input.oldSnapshot);
  const meta: RiskManagementApprovalMeta = {
    payload: input.payload,
    role: input.role,
  };
  return approvalsService.createRequest({
    screenKey: 'risk.admin',
    screenName: 'Risk Yönetimi Değişikliği',
    initiatedBy: user,
    requiredApprovals: resolveRequiredApprovals('risk.admin'),
    payload: {
      screenKey: 'risk.admin',
      summary: 'Risk yönetimi referans / grup / yönlendirme / parametre',
      changes: buildRiskChanges(newValues, oldValues),
      newValues,
      oldValues,
      raw: meta as unknown as Record<string, unknown>,
    },
  });
}

export function parseRiskManagementApprovalMeta(approval: ApprovalRequest): RiskManagementApprovalMeta | null {
  if (approval.payload.screenKey !== 'risk.admin') return null;
  const raw = approval.payload.raw as RiskManagementApprovalMeta | undefined;
  if (!raw?.payload) return null;
  return raw;
}

export type RiskManagementApprovalApplyFn = (meta: RiskManagementApprovalMeta) => void;

let applyHandler: RiskManagementApprovalApplyFn | null = null;

export function registerRiskManagementApprovalApply(fn: RiskManagementApprovalApplyFn): void {
  applyHandler = fn;
}

export function applyRiskManagementApprovalIfNeeded(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  const meta = parseRiskManagementApprovalMeta(approval);
  if (!meta) return;
  applyHandler?.(meta);
}
