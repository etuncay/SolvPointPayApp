import type { BackOfficeRole } from '@epay/ui';
import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { computeChangedFields } from '@/features/approval-pool/domain/compute-changed-fields';
import { resolveRequiredApprovals } from '@/features/approval-pool/domain/resolve-required-approvals';
import type { ApprovalRequest, PayloadChange } from '@/features/approval-pool/domain/types';
import type { AgentFeeInput, AgentFeeUpdateInput } from '../domain/types';

export type AgentFeeApprovalMeta =
  | { mode: 'new'; input: AgentFeeInput }
  | { mode: 'edit'; feeId: number; input: AgentFeeUpdateInput; groupCode: string; transactionType: string; currency: string };

const AGENT_FEE_LABELS: Record<string, string> = {
  groupCode: 'Grup Kodu',
  transactionType: 'İşlem Tipi',
  currency: 'Para Birimi',
  lowerLimit: 'Alt Limit',
  fixedFee: 'Sabit Ücret',
  variableFeePct: 'Değişken %',
  startDate: 'Başlangıç',
  endDate: 'Bitiş',
};

function buildChanges(newValues: Record<string, unknown>, oldValues?: Record<string, unknown>): PayloadChange[] {
  return computeChangedFields(newValues, oldValues).map((field) => ({
    field,
    label: AGENT_FEE_LABELS[field] ?? field,
    oldValue: oldValues?.[field] != null ? String(oldValues[field]) : '—',
    newValue: newValues[field] != null ? String(newValues[field]) : '—',
  }));
}

export function createAgentFeeApprovalRequest(
  input:
    | { mode: 'new'; values: AgentFeeInput }
    | { mode: 'edit'; feeId: number; values: AgentFeeUpdateInput; oldValues: Record<string, unknown>; identity: { groupCode: string; transactionType: string; currency: string } },
  role: BackOfficeRole,
): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(role);
  if (input.mode === 'new') {
    const newValues = { ...input.values };
    const meta: AgentFeeApprovalMeta = { mode: 'new', input: input.values };
    return approvalsService.createRequest({
      screenKey: 'agent_fee',
      screenName: 'Yeni Temsilci Ücreti',
      initiatedBy: user,
      requiredApprovals: resolveRequiredApprovals('agent_fee'),
      payload: {
        screenKey: 'agent_fee',
        summary: `${input.values.groupCode} / ${input.values.transactionType}`,
        changes: buildChanges(newValues),
        newValues,
        raw: meta as unknown as Record<string, unknown>,
      },
    });
  }
  const newValues = { ...input.values };
  const meta: AgentFeeApprovalMeta = {
    mode: 'edit',
    feeId: input.feeId,
    input: input.values,
    groupCode: input.identity.groupCode,
    transactionType: input.identity.transactionType,
    currency: input.identity.currency,
  };
  return approvalsService.createRequest({
    screenKey: 'agent_fee',
    screenName: 'Temsilci Ücreti Düzenleme',
    initiatedBy: user,
    requiredApprovals: resolveRequiredApprovals('agent_fee'),
    payload: {
      screenKey: 'agent_fee',
      summary: `${input.identity.groupCode} / ${input.identity.transactionType}`,
      changes: buildChanges(newValues, input.oldValues),
      newValues,
      oldValues: input.oldValues,
      raw: meta as unknown as Record<string, unknown>,
    },
  });
}

export function parseAgentFeeApprovalMeta(approval: ApprovalRequest): AgentFeeApprovalMeta | null {
  if (approval.payload.screenKey !== 'agent_fee') return null;
  const raw = approval.payload.raw as AgentFeeApprovalMeta | undefined;
  if (!raw) return null;
  return raw;
}

export type AgentFeeApprovalApplyFn = (meta: AgentFeeApprovalMeta) => void;

let applyHandler: AgentFeeApprovalApplyFn | null = null;

export function registerAgentFeeApprovalApply(fn: AgentFeeApprovalApplyFn): void {
  applyHandler = fn;
}

export function applyAgentFeeApprovalIfNeeded(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  const meta = parseAgentFeeApprovalMeta(approval);
  if (!meta) return;
  applyHandler?.(meta);
}
