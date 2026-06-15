import type { BackOfficeRole } from '@epay/ui';
import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { buildApprovalChanges } from '@/features/approval-pool/domain/compute-changed-fields';
import { resolveRequiredApprovals } from '@/features/approval-pool/domain/resolve-required-approvals';
import type { ApprovalRequest } from '@/features/approval-pool/domain/types';
import { buildAgentFormConfig } from '../agent-form-config';
import type { AgentFormValues } from '../domain/types';

export type AgentApprovalMeta = {
  mode: 'new' | 'edit';
  agentId: string | null;
  displayName: string;
  fullValues: AgentFormValues;
};

export function toAgentApprovalValues(v: AgentFormValues): Record<string, unknown> {
  const {
    banks,
    addresses,
    contacts,
    documents,
    wallets,
    shareholders,
    authorizedPersons,
    limits,
    ...scalars
  } = v;
  void banks;
  void addresses;
  void contacts;
  void documents;
  void wallets;
  void shareholders;
  void authorizedPersons;
  return {
    ...scalars,
    'limits.perTx': limits?.perTx,
    'limits.daily': limits?.daily,
    'limits.monthly': limits?.monthly,
  };
}

export function createAgentApprovalRequest(
  input: {
    mode: 'new' | 'edit';
    agentId: string | null;
    values: AgentFormValues;
    oldValues?: AgentFormValues | null;
  },
  role: BackOfficeRole,
): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(role);
  const newValues = toAgentApprovalValues(input.values);
  const oldValues = input.oldValues ? toAgentApprovalValues(input.oldValues) : undefined;
  const config = buildAgentFormConfig();
  const meta: AgentApprovalMeta = {
    mode: input.mode,
    agentId: input.agentId,
    displayName: input.values.name || '—',
    fullValues: input.values,
  };
  return approvalsService.createRequest({
    screenKey: 'agent_edit',
    screenName: input.mode === 'new' ? 'Yeni Temsilci' : 'Temsilci Düzenleme',
    initiatedBy: user,
    requiredApprovals: resolveRequiredApprovals('agent_edit'),
    payload: {
      screenKey: 'agent_edit',
      formKey: 'agent',
      summary: `${meta.displayName} — ${input.mode === 'new' ? 'yeni kayıt' : 'düzenleme'}`,
      changes: buildApprovalChanges(config, newValues, oldValues),
      newValues,
      oldValues,
      raw: meta as unknown as Record<string, unknown>,
    },
  });
}

export function parseAgentApprovalMeta(approval: ApprovalRequest): AgentApprovalMeta | null {
  if (approval.payload.screenKey !== 'agent_edit') return null;
  const raw = approval.payload.raw as AgentApprovalMeta | undefined;
  if (!raw?.fullValues) return null;
  return raw;
}

export type AgentApprovalApplyFn = (meta: AgentApprovalMeta) => void;

let applyHandler: AgentApprovalApplyFn | null = null;

export function registerAgentApprovalApply(fn: AgentApprovalApplyFn): void {
  applyHandler = fn;
}

export function applyAgentApprovalIfNeeded(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  const meta = parseAgentApprovalMeta(approval);
  if (!meta) return;
  applyHandler?.(meta);
}
