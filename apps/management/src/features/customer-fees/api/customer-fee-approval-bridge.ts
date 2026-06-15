import type { BackOfficeRole } from '@epay/ui';
import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { computeChangedFields } from '@/features/approval-pool/domain/compute-changed-fields';
import { resolveRequiredApprovals } from '@/features/approval-pool/domain/resolve-required-approvals';
import type { ApprovalRequest, PayloadChange } from '@/features/approval-pool/domain/types';
import type { CustomerFeeInput } from '../domain/types';

export type CustomerFeeApprovalMeta = {
  mode: 'new' | 'edit';
  feeId: number | null;
  input: CustomerFeeInput;
};

const FEE_LABELS: Record<keyof CustomerFeeInput, string> = {
  transactionType: 'İşlem Tipi',
  currency: 'Para Birimi',
  lowerLimit: 'Alt Limit',
  fixedFee: 'Sabit Ücret',
  variableFeePct: 'Değişken %',
  startDate: 'Başlangıç',
  endDate: 'Bitiş',
  sourceCountry: 'Kaynak Ülke',
  targetCountry: 'Hedef Ülke',
};

function toFeeValues(input: CustomerFeeInput): Record<string, unknown> {
  return { ...input };
}

function buildFeeChanges(newValues: Record<string, unknown>, oldValues?: Record<string, unknown>): PayloadChange[] {
  const fields = computeChangedFields(newValues, oldValues);
  return fields.map((field) => ({
    field,
    label: FEE_LABELS[field as keyof CustomerFeeInput] ?? field,
    oldValue: oldValues?.[field] != null ? String(oldValues[field]) : '—',
    newValue: newValues[field] != null ? String(newValues[field]) : '—',
  }));
}

export function createCustomerFeeApprovalRequest(
  input: { mode: 'new' | 'edit'; feeId: number | null; values: CustomerFeeInput; oldValues?: CustomerFeeInput | null },
  role: BackOfficeRole,
): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(role);
  const newValues = toFeeValues(input.values);
  const oldValues = input.oldValues ? toFeeValues(input.oldValues) : undefined;
  const meta: CustomerFeeApprovalMeta = {
    mode: input.mode,
    feeId: input.feeId,
    input: input.values,
  };
  return approvalsService.createRequest({
    screenKey: 'customer_fee',
    screenName: input.mode === 'new' ? 'Yeni Müşteri Ücreti' : 'Müşteri Ücreti Düzenleme',
    initiatedBy: user,
    requiredApprovals: resolveRequiredApprovals('customer_fee'),
    payload: {
      screenKey: 'customer_fee',
      summary: `${input.values.transactionType} / ${input.values.currency}`,
      changes: buildFeeChanges(newValues, oldValues),
      newValues,
      oldValues,
      raw: meta as unknown as Record<string, unknown>,
    },
  });
}

export function parseCustomerFeeApprovalMeta(approval: ApprovalRequest): CustomerFeeApprovalMeta | null {
  if (approval.payload.screenKey !== 'customer_fee') return null;
  const raw = approval.payload.raw as CustomerFeeApprovalMeta | undefined;
  if (!raw?.input) return null;
  return raw;
}

export type CustomerFeeApprovalApplyFn = (meta: CustomerFeeApprovalMeta) => void;

let applyHandler: CustomerFeeApprovalApplyFn | null = null;

export function registerCustomerFeeApprovalApply(fn: CustomerFeeApprovalApplyFn): void {
  applyHandler = fn;
}

export function applyCustomerFeeApprovalIfNeeded(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  const meta = parseCustomerFeeApprovalMeta(approval);
  if (!meta) return;
  applyHandler?.(meta);
}
