import type { BackOfficeRole } from '@epay/ui';
import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { buildApprovalChanges } from '@/features/approval-pool/domain/compute-changed-fields';
import { resolveRequiredApprovals } from '@/features/approval-pool/domain/resolve-required-approvals';
import type { ApprovalRequest } from '@/features/approval-pool/domain/types';
import { buildCorporateFormConfig } from '../corporate-form-config';
import type { CorporateFormValues } from '../domain/types';

export type CorporateApprovalMeta = {
  mode: 'new' | 'edit';
  customerId: string | null;
  displayName: string;
  fullValues: CorporateFormValues;
};

/** Form değerlerini onay görünümünün skaler alan haritasına çevirir (limits düzleştirilir). */
export function toCorporateApprovalValues(v: CorporateFormValues): Record<string, unknown> {
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

export function createCorporateApprovalRequest(
  input: {
    mode: 'new' | 'edit';
    customerId: string | null;
    values: CorporateFormValues;
    oldValues?: CorporateFormValues | null;
  },
  role: BackOfficeRole,
): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(role);
  const newValues = toCorporateApprovalValues(input.values);
  const oldValues = input.oldValues ? toCorporateApprovalValues(input.oldValues) : undefined;
  const config = buildCorporateFormConfig();
  const meta: CorporateApprovalMeta = {
    mode: input.mode,
    customerId: input.customerId,
    displayName: input.values.tradeName || '—',
    fullValues: input.values,
  };
  return approvalsService.createRequest({
    screenKey: 'customer_corporate',
    screenName: input.mode === 'new' ? 'Yeni Kurumsal Müşteri' : 'Kurumsal Müşteri Düzenleme',
    initiatedBy: user,
    requiredApprovals: resolveRequiredApprovals('customer_corporate'),
    payload: {
      screenKey: 'customer_corporate',
      formKey: 'corporate',
      summary: `${meta.displayName} — ${input.mode === 'new' ? 'yeni kayıt' : 'düzenleme'}`,
      changes: buildApprovalChanges(config, newValues, oldValues),
      newValues,
      oldValues,
      raw: meta as unknown as Record<string, unknown>,
    },
  });
}

export function parseCorporateApprovalMeta(approval: ApprovalRequest): CorporateApprovalMeta | null {
  if (approval.payload.screenKey !== 'customer_corporate') return null;
  const raw = approval.payload.raw as CorporateApprovalMeta | undefined;
  if (!raw?.fullValues) return null;
  return raw;
}

export type CorporateApprovalApplyFn = (meta: CorporateApprovalMeta) => void;

let applyHandler: CorporateApprovalApplyFn | null = null;

export function registerCorporateApprovalApply(fn: CorporateApprovalApplyFn): void {
  applyHandler = fn;
}

export function applyCorporateApprovalIfNeeded(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  const meta = parseCorporateApprovalMeta(approval);
  if (!meta) return;
  applyHandler?.(meta);
}
