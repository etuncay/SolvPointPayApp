import type { BackOfficeRole } from '@epay/ui';
import { BACKOFFICE_SCREENS } from '@/features/system/shared/screen-registry';
import {
  appendFieldRule,
  deleteFieldRule,
  getFieldApprovalRulesStore,
  getFieldRuleById,
  updateFieldRule,
} from '@/mocks/field-approval-rules';
import {
  getScreenApprovalRulesStore,
  updateScreenApprovalRules,
} from '@/mocks/screen-approval-rules';
import {
  checkFieldRuleApproverAvailability,
  checkScreenApproverAvailability,
} from '../domain/approver-availability';
import { validateFieldRuleExpression } from '../domain/expression-validator';
import { canAccessApprovalRules, canUpdateApprovalRules } from '../domain/permissions';
import { rebuildBlockedScreenWrites } from '../domain/screen-mutation-guard';
import {
  normalizeFieldRuleInput,
  validateFieldRuleLimits,
  validateUniqueOperationName,
} from '../domain/validation';
import type {
  ApproverAvailabilityIssue,
  FieldApprovalRule,
  FieldApprovalRuleInput,
  ScreenApprovalRule,
} from '../domain/types';
import type { ApprovalRulesService, SaveFieldsResult, SaveScreensResult } from './approval-rules-service';

type AuditEntry = {
  at: string;
  entity: 'screen' | 'field';
  action: string;
  detail: string;
};

let auditLog: AuditEntry[] = [];

function log(entity: AuditEntry['entity'], action: string, detail: string) {
  auditLog = [
    { at: new Date('2026-05-24T12:00:00Z').toISOString(), entity, action, detail },
    ...auditLog,
  ];
}

function toScreenRules(): ScreenApprovalRule[] {
  const defs = new Map(BACKOFFICE_SCREENS.map((s) => [s.screenId, s]));
  return getScreenApprovalRulesStore().map((r) => {
    const def = defs.get(r.screenId);
    return {
      id: r.id,
      moduleId: r.moduleId,
      screenId: r.screenId,
      screenKey: r.screenKey,
      moduleLabelKey: def?.moduleLabelKey ?? r.moduleId,
      screenLabelKey: def?.labelKey ?? r.screenId,
      approvalCount: r.approvalCount,
    };
  });
}

function toFieldRules(): FieldApprovalRule[] {
  return getFieldApprovalRulesStore().map((r) => ({ ...r }));
}

function fieldWarnings(input: FieldApprovalRuleInput): ApproverAvailabilityIssue[] {
  if (checkFieldRuleApproverAvailability(input.approvalCount)) return [];
  return [
    {
      screenKey: input.screenId,
      screenLabelKey: input.screenId,
      approvalCount: input.approvalCount,
      missing: input.approvalCount >= 2 ? ['first', 'second'] : ['first'],
    },
  ];
}

export function resetApprovalRulesAudit(): void {
  auditLog = [];
}

export const approvalRulesService: ApprovalRulesService = {
  listScreens(role) {
    if (!canAccessApprovalRules(role)) return [];
    return toScreenRules();
  },

  saveScreens(role, updates) {
    if (!canUpdateApprovalRules(role)) {
      return { ok: false, errorCode: 'frd_forbidden', issues: [] };
    }
    const rules = toScreenRules();
    const issues: ApproverAvailabilityIssue[] = [];
    for (const u of updates) {
      const row = rules.find((r) => r.id === u.id);
      if (!row || row.approvalCount === u.approvalCount) continue;
      const issue = checkScreenApproverAvailability(
        row.screenKey,
        row.screenLabelKey,
        u.approvalCount,
      );
      if (issue) issues.push(issue);
    }
    if (issues.length > 0) {
      return { ok: false, errorCode: 'ar_screen_save_blocked', issues };
    }
    updateScreenApprovalRules(updates);
    rebuildBlockedScreenWrites();
    log('screen', 'batch_update', JSON.stringify(updates));
    return { ok: true };
  },

  listFields(role) {
    if (!canAccessApprovalRules(role)) return [];
    return toFieldRules();
  },

  createField(role, raw) {
    if (!canUpdateApprovalRules(role)) {
      return { ok: false, errorCode: 'frd_forbidden' };
    }
    const input = normalizeFieldRuleInput(raw);
    const dup = validateUniqueOperationName(input.operationName);
    if (dup) return { ok: false, errorCode: dup };
    const lim = validateFieldRuleLimits(
      input.scope,
      input.noApprovalLimit,
      input.oneApprovalLimit,
    );
    if (lim) return { ok: false, errorCode: lim };
    appendFieldRule(input);
    log('field', 'create', input.operationName);
    return { ok: true, warnings: fieldWarnings(input) };
  },

  updateField(role, id, raw) {
    if (!canUpdateApprovalRules(role)) {
      return { ok: false, errorCode: 'frd_forbidden' };
    }
    const existing = getFieldRuleById(id);
    if (!existing) return { ok: false, errorCode: 'frd_not_found' };
    const input = normalizeFieldRuleInput({ ...existing, ...raw, operationName: existing.operationName });
    const lim = validateFieldRuleLimits(
      input.scope,
      input.noApprovalLimit,
      input.oneApprovalLimit,
    );
    if (lim) return { ok: false, errorCode: lim };
    updateFieldRule(id, input);
    log('field', 'update', id);
    return { ok: true, warnings: fieldWarnings(input) };
  },

  deleteField(role, id) {
    if (!canUpdateApprovalRules(role)) {
      return { ok: false, errorCode: 'frd_forbidden' };
    }
    const ok = deleteFieldRule(id);
    if (ok) log('field', 'delete', id);
    return ok ? { ok: true } : { ok: false, errorCode: 'frd_not_found' };
  },

  validateFieldRule(input) {
    return validateFieldRuleExpression(input);
  },
};

export function getApprovalRulesAudit() {
  return auditLog;
}
