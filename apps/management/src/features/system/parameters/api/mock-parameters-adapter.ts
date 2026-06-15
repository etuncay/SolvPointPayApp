import type { BackOfficeRole } from '@epay/ui';
import { userDisplayNameById } from '@/mocks/app-users';
import {
  createParameterRecord,
  getParameterById,
  getSystemParametersStore,
  updateParameterRecord,
} from '@/mocks/system-parameters';
import { getCatalogEntry } from '../domain/parameter-catalog';
import { canAccessParameters, canInsertParameters, canUpdateParameters } from '../domain/permissions';
import {
  needsCriticalZeroConfirm,
  validateParameterValue,
} from '../domain/validate-parameter-value';
import type { ParameterFilters, ParameterFormInput, UpdateParameterPayload } from '../domain/types';
import type { ParameterAuditEntry, ParametersService } from './parameters-service';
import {
  registerParameterApprovalApply,
  type ParameterApprovalMeta,
} from './parameter-approval-bridge';

let auditLog: ParameterAuditEntry[] = [];

function log(entry: Omit<ParameterAuditEntry, 'at'>) {
  auditLog = [{ at: new Date('2026-05-24T12:00:00Z').toISOString(), ...entry }, ...auditLog];
}

export function resetParametersAuditLog(): void {
  auditLog = [];
}

export const parametersService: ParametersService = {
  list(role, filters) {
    if (!canAccessParameters(role)) return [];
    let rows = getSystemParametersStore();
    if (filters.group !== 'any') {
      rows = rows.filter((r) => r.groupName === filters.group);
    }
    if (filters.status !== 'any') {
      rows = rows.filter((r) => r.status === filters.status);
    }
    if (filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.parameterKey.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q),
      );
    }
    return rows.sort((a, b) =>
      a.groupName.localeCompare(b.groupName) || a.parameterKey.localeCompare(b.parameterKey),
    );
  },

  create(role, userId, input, options) {
    if (!canInsertParameters(role)) {
      return { ok: false, errorCode: 'frd_forbidden' };
    }
    const entry = getCatalogEntry(input.parameterKey);
    if (!entry) return { ok: false, errorCode: 'prm_unknown_key' };

    const err = validateParameterValue(input.parameterKey, input.value);
    if (err) return { ok: false, errorCode: err };
    if (
      !options?.skipCriticalConfirm &&
      needsCriticalZeroConfirm(input.parameterKey, input.value)
    ) {
      return { ok: false, errorCode: 'prm_critical_confirm', needsConfirm: true };
    }

    const now = new Date('2026-05-24T12:00:00Z').toISOString();
    const created = createParameterRecord({
      groupName: entry.groupName,
      parameterKey: entry.parameterKey,
      value: input.value,
      valueType: entry.valueType,
      description: entry.descriptionKey,
      status: input.status,
      changedBy: userId,
      changedByName: userDisplayNameById(userId),
      changedAt: now,
    });
    if (!created) return { ok: false, errorCode: 'prm_duplicate_key' };

    log({
      parameterKey: created.parameterKey,
      field: 'value',
      oldValue: '—',
      newValue: created.value,
      userId,
    });
    return { ok: true, row: created };
  },

  update(role, userId, id, payload, options) {
    if (!canUpdateParameters(role)) {
      return { ok: false, errorCode: 'frd_forbidden' };
    }
    const row = getParameterById(id);
    if (!row) return { ok: false, errorCode: 'prm_not_found' };

    const nextValue = payload.value ?? row.value;
    const nextStatus = payload.status ?? row.status;

    if (payload.value != null) {
      const err = validateParameterValue(row.parameterKey, nextValue);
      if (err) return { ok: false, errorCode: err };
      if (
        !options?.skipCriticalConfirm &&
        needsCriticalZeroConfirm(row.parameterKey, nextValue)
      ) {
        return { ok: false, errorCode: 'prm_critical_confirm', needsConfirm: true };
      }
    }

    const now = new Date('2026-05-24T12:00:00Z').toISOString();
    if (payload.value != null && payload.value !== row.value) {
      log({
        parameterKey: row.parameterKey,
        field: 'value',
        oldValue: row.value,
        newValue: nextValue,
        userId,
      });
    }
    if (payload.status != null && payload.status !== row.status) {
      log({
        parameterKey: row.parameterKey,
        field: 'status',
        oldValue: row.status,
        newValue: nextStatus,
        userId,
      });
    }

    const updated = updateParameterRecord(id, {
      value: nextValue,
      status: nextStatus,
      changedBy: userId,
      changedByName: userDisplayNameById(userId),
      changedAt: now,
    });
    if (!updated) return { ok: false, errorCode: 'prm_not_found' };
    return { ok: true, row: updated };
  },

  getAuditLog(parameterKey) {
    if (parameterKey) return auditLog.filter((e) => e.parameterKey === parameterKey);
    return [...auditLog];
  },
};

registerParameterApprovalApply((meta: ParameterApprovalMeta) => {
  const opts = { skipCriticalConfirm: meta.skipCriticalConfirm ?? true };
  if (meta.mode === 'new') {
    parametersService.create(meta.role, meta.userId, meta.input, opts);
    return;
  }
  if (!meta.parameterId) return;
  const payload: UpdateParameterPayload = {
    value: meta.input.value,
    status: meta.input.status,
  };
  parametersService.update(meta.role, meta.userId, meta.parameterId, payload, opts);
});
