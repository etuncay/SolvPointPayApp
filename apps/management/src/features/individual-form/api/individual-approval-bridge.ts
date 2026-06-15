import type { BackOfficeRole } from '@epay/ui';
import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { buildApprovalChanges } from '@/features/approval-pool/domain/compute-changed-fields';
import { resolveRequiredApprovals } from '@/features/approval-pool/domain/resolve-required-approvals';
import type { ApprovalRequest } from '@/features/approval-pool/domain/types';
import { buildIndividualFormConfig } from '../individual-form-config';
import type { IndividualFormValues } from '../domain/types';

export type IndividualApprovalMeta = {
  mode: 'new' | 'edit';
  customerId: string | null;
  displayName: string;
  /** Onay sonrası gerçek create/update için tam form değerleri */
  fullValues: IndividualFormValues;
};

/** Form değerlerini onay görünümünün skaler alan haritasına çevirir (limits düzleştirilir). */
export function toIndividualApprovalValues(v: IndividualFormValues): Record<string, unknown> {
  const { banks, addresses, contacts, documents, wallets, limits, ...scalars } = v as IndividualFormValues & {
    limits?: { perTx?: number; daily?: number; monthly?: number };
  };
  void banks;
  void addresses;
  void contacts;
  void documents;
  void wallets;
  return {
    ...scalars,
    'limits.perTx': limits?.perTx,
    'limits.daily': limits?.daily,
    'limits.monthly': limits?.monthly,
  };
}

export function createIndividualApprovalRequest(
  input: {
    mode: 'new' | 'edit';
    customerId: string | null;
    values: IndividualFormValues;
    oldValues?: IndividualFormValues | null;
  },
  role: BackOfficeRole,
): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(role);
  const newValues = toIndividualApprovalValues(input.values);
  const oldValues = input.oldValues ? toIndividualApprovalValues(input.oldValues) : undefined;
  const config = buildIndividualFormConfig();
  const meta: IndividualApprovalMeta = {
    mode: input.mode,
    customerId: input.customerId,
    displayName: input.values.fullName || '—',
    fullValues: input.values,
  };
  return approvalsService.createRequest({
    screenKey: 'customer_individual',
    screenName: input.mode === 'new' ? 'Yeni Bireysel Müşteri' : 'Bireysel Müşteri Düzenleme',
    initiatedBy: user,
    requiredApprovals: resolveRequiredApprovals('customer_individual'),
    payload: {
      screenKey: 'customer_individual',
      formKey: 'individual',
      summary: `${meta.displayName} — ${input.mode === 'new' ? 'yeni kayıt' : 'düzenleme'}`,
      changes: buildApprovalChanges(config, newValues, oldValues),
      newValues,
      oldValues,
      raw: meta as unknown as Record<string, unknown>,
    },
  });
}

export function parseIndividualApprovalMeta(approval: ApprovalRequest): IndividualApprovalMeta | null {
  if (approval.payload.screenKey !== 'customer_individual') return null;
  const raw = approval.payload.raw as IndividualApprovalMeta | undefined;
  if (!raw?.fullValues) return null;
  return raw;
}

/** Onay sonrası uygulanır — gerçek create/update'i feature adapter'ı kaydeder. */
export type IndividualApprovalApplyFn = (meta: IndividualApprovalMeta) => void;

let applyHandler: IndividualApprovalApplyFn | null = null;

export function registerIndividualApprovalApply(fn: IndividualApprovalApplyFn): void {
  applyHandler = fn;
}

export function applyIndividualApprovalIfNeeded(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  const meta = parseIndividualApprovalMeta(approval);
  if (!meta) return;
  applyHandler?.(meta);
}
