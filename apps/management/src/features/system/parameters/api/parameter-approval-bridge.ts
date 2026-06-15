import type { BackOfficeRole } from '@epay/ui';
import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { computeChangedFields } from '@/features/approval-pool/domain/compute-changed-fields';
import { resolveRequiredApprovals } from '@/features/approval-pool/domain/resolve-required-approvals';
import type { ApprovalRequest, PayloadChange } from '@/features/approval-pool/domain/types';
import { getCatalogEntry } from '../domain/parameter-catalog';
import type { ParameterFormInput, ParameterStatus, UpdateParameterPayload } from '../domain/types';

export type ParameterApprovalMeta = {
  mode: 'new' | 'edit';
  parameterId: string | null;
  parameterKey: string;
  input: ParameterFormInput;
  role: BackOfficeRole;
  userId: string;
  skipCriticalConfirm?: boolean;
};

const PARAMETER_LABELS: Record<keyof ParameterFormInput, string> = {
  parameterKey: 'Anahtar',
  groupName: 'Grup',
  valueType: 'Değer tipi',
  description: 'Açıklama',
  value: 'Değer',
  status: 'Durum',
};

function toFormValues(input: ParameterFormInput): Record<string, unknown> {
  return { ...input };
}

function buildFormChanges(
  newValues: Record<string, unknown>,
  oldValues?: Record<string, unknown>,
): PayloadChange[] {
  const fields = computeChangedFields(newValues, oldValues);
  return fields.map((field) => ({
    field,
    label: PARAMETER_LABELS[field as keyof ParameterFormInput] ?? field,
    oldValue: oldValues?.[field] != null ? String(oldValues[field]) : '—',
    newValue: newValues[field] != null ? String(newValues[field]) : '—',
  }));
}

function buildLegacyParameterChanges(
  parameterKey: string,
  before: { value: string; status: ParameterStatus },
  after: UpdateParameterPayload,
): PayloadChange[] {
  const changes: PayloadChange[] = [];
  if (after.value != null && after.value !== before.value) {
    changes.push({
      field: 'value',
      label: parameterKey,
      oldValue: before.value,
      newValue: after.value,
    });
  }
  if (after.status != null && after.status !== before.status) {
    changes.push({
      field: 'status',
      label: `${parameterKey} (status)`,
      oldValue: before.status,
      newValue: after.status,
    });
  }
  return changes;
}

/** Form kaydetme — tüm ekleme/güncelleme onaya gider */
export function createParameterFormApprovalRequest(
  input: {
    mode: 'new' | 'edit';
    parameterId: string | null;
    values: ParameterFormInput;
    oldValues?: ParameterFormInput | null;
    role: BackOfficeRole;
    userId: string;
    skipCriticalConfirm?: boolean;
  },
): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(input.role);
  const entry = getCatalogEntry(input.values.parameterKey);
  const newValues = toFormValues(input.values);
  const oldValues = input.oldValues ? toFormValues(input.oldValues) : undefined;
  const meta: ParameterApprovalMeta = {
    mode: input.mode,
    parameterId: input.parameterId,
    parameterKey: input.values.parameterKey,
    input: input.values,
    role: input.role,
    userId: input.userId,
    skipCriticalConfirm: input.skipCriticalConfirm,
  };
  return approvalsService.createRequest({
    screenKey: 'system_parameters',
    screenName: input.mode === 'new' ? 'Yeni Sistem Parametresi' : 'Sistem Parametresi Düzenleme',
    initiatedBy: user,
    requiredApprovals: resolveRequiredApprovals('system_parameters'),
    payload: {
      screenKey: 'system_parameters',
      formKey: 'system_parameter',
      summary: entry?.descriptionKey ?? input.values.parameterKey,
      changes: buildFormChanges(newValues, oldValues),
      newValues,
      oldValues,
      raw: meta as unknown as Record<string, unknown>,
    },
  });
}

/** @deprecated Satır içi güncelleme — form akışı createParameterFormApprovalRequest kullanır */
export function createParameterApprovalRequest(input: {
  parameterId: string;
  parameterKey: string;
  before: { value: string; status: ParameterStatus };
  payload: UpdateParameterPayload;
  role: BackOfficeRole;
  userId: string;
  skipCriticalConfirm?: boolean;
}): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(input.role);
  const entry = getCatalogEntry(input.parameterKey);
  const formInput: ParameterFormInput = {
    parameterKey: input.parameterKey,
    groupName: entry?.groupName ?? 'approval',
    valueType: entry?.valueType ?? 'string',
    description: entry?.descriptionKey ?? input.parameterKey,
    value: input.payload.value ?? input.before.value,
    status: input.payload.status ?? input.before.status,
  };
  const meta: ParameterApprovalMeta = {
    mode: 'edit',
    parameterId: input.parameterId,
    parameterKey: input.parameterKey,
    input: formInput,
    role: input.role,
    userId: input.userId,
    skipCriticalConfirm: input.skipCriticalConfirm,
  };
  return approvalsService.createRequest({
    screenKey: 'system_parameters',
    screenName: 'Sistem Parametresi Değişikliği',
    initiatedBy: user,
    requiredApprovals: resolveRequiredApprovals('system_parameters'),
    payload: {
      screenKey: 'system_parameters',
      formKey: 'system_parameter',
      summary: entry?.descriptionKey ?? input.parameterKey,
      changes: buildLegacyParameterChanges(input.parameterKey, input.before, input.payload),
      newValues: {
        parameterKey: input.parameterKey,
        ...input.payload,
      },
      oldValues: {
        parameterKey: input.parameterKey,
        value: input.before.value,
        status: input.before.status,
      },
      raw: meta as unknown as Record<string, unknown>,
    },
  });
}

export function parseParameterApprovalMeta(approval: ApprovalRequest): ParameterApprovalMeta | null {
  if (approval.payload.screenKey !== 'system_parameters') return null;
  const raw = approval.payload.raw as ParameterApprovalMeta | undefined;
  if (!raw?.parameterKey || !raw.input) return null;
  return raw;
}

export type ParameterApprovalApplyFn = (meta: ParameterApprovalMeta) => void;

let applyHandler: ParameterApprovalApplyFn | null = null;

export function registerParameterApprovalApply(fn: ParameterApprovalApplyFn): void {
  applyHandler = fn;
}

export function applyParameterApprovalIfNeeded(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  const meta = parseParameterApprovalMeta(approval);
  if (!meta) return;
  applyHandler?.(meta);
}
