import type { BackOfficeRole } from '@epay/ui';
import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { buildApprovalChanges } from '@/features/approval-pool/domain/compute-changed-fields';
import { resolveRequiredApprovals } from '@/features/approval-pool/domain/resolve-required-approvals';
import type { ApprovalRequest } from '@/features/approval-pool/domain/types';
import { buildAPFormConfig } from '../agent-person-form-config';
import type { AuthorizedPersonFormValues } from '../domain/types';

export type AuthorizedPersonApprovalMeta = {
  mode: 'new' | 'edit';
  personId: string | null;
  agentId: string | null;
  displayName: string;
  fullValues: AuthorizedPersonFormValues;
};

export function toAuthorizedPersonApprovalValues(v: AuthorizedPersonFormValues): Record<string, unknown> {
  const { addresses, contacts, documents, ...scalars } = v;
  void addresses;
  void contacts;
  void documents;
  return { ...scalars };
}

export function createAuthorizedPersonApprovalRequest(
  input: {
    mode: 'new' | 'edit';
    personId: string | null;
    agentId: string | null;
    values: AuthorizedPersonFormValues;
    oldValues?: AuthorizedPersonFormValues | null;
  },
  role: BackOfficeRole,
): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(role);
  const newValues = toAuthorizedPersonApprovalValues(input.values);
  const oldValues = input.oldValues ? toAuthorizedPersonApprovalValues(input.oldValues) : undefined;
  const config = buildAPFormConfig();
  const meta: AuthorizedPersonApprovalMeta = {
    mode: input.mode,
    personId: input.personId,
    agentId: input.agentId,
    displayName: input.values.fullName || '—',
    fullValues: input.values,
  };
  return approvalsService.createRequest({
    screenKey: 'authorized_person',
    screenName: input.mode === 'new' ? 'Yeni Yetkili Kişi' : 'Yetkili Kişi Düzenleme',
    initiatedBy: user,
    requiredApprovals: resolveRequiredApprovals('authorized_person'),
    payload: {
      screenKey: 'authorized_person',
      formKey: 'authorized_person',
      summary: `${meta.displayName} — ${input.mode === 'new' ? 'yeni kayıt' : 'düzenleme'}`,
      changes: buildApprovalChanges(config, newValues, oldValues),
      newValues,
      oldValues,
      raw: meta as unknown as Record<string, unknown>,
    },
  });
}

export function parseAuthorizedPersonApprovalMeta(
  approval: ApprovalRequest,
): AuthorizedPersonApprovalMeta | null {
  if (approval.payload.screenKey !== 'authorized_person') return null;
  const raw = approval.payload.raw as AuthorizedPersonApprovalMeta | undefined;
  if (!raw?.fullValues) return null;
  return raw;
}

export type AuthorizedPersonApprovalApplyFn = (meta: AuthorizedPersonApprovalMeta) => void;

let applyHandler: AuthorizedPersonApprovalApplyFn | null = null;

export function registerAuthorizedPersonApprovalApply(fn: AuthorizedPersonApprovalApplyFn): void {
  applyHandler = fn;
}

export function applyAuthorizedPersonApprovalIfNeeded(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  const meta = parseAuthorizedPersonApprovalMeta(approval);
  if (!meta) return;
  applyHandler?.(meta);
}
