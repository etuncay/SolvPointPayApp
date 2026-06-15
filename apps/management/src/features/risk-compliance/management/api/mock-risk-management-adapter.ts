import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { isOpenCase } from '@/features/risk-compliance/cases/domain/case-status-groups';
import { __getFraudCasesStore } from '@/features/risk-compliance/cases/api/mock-fraud-cases-adapter';
import { COMPLIANCE_STAFF } from '@/mocks/compliance-staff';
import { RM_CASE_GROUPS_SEED } from '@/mocks/case-groups';
import { CASE_ROUTING_RULES_SEED } from '@/mocks/case-routing-rules';
import { FRAUD_ENGINE_PARAMS_SEED } from '@/mocks/fraud-engine-params';
import { OCCUPATION_THRESHOLDS_SEED } from '@/mocks/occupation-thresholds';
import { REFERENCE_LIST_SEED } from '@/mocks/reference-lists';
import type { BackOfficeRole } from '@epay/ui';
import { pickMemberByWorkload } from '../domain/auto-distribute';
import { assertGroupsSaveable } from '../domain/group-guards';
import { getRiskManagementPermissions } from '../domain/permissions';
import { registerRiskManagementApprovalApply } from './risk-management-approval-bridge';
import { REFERENCE_LIST_CODES } from '../domain/types';
import type {
  AssignableGroup,
  CaseGroup,
  CaseRoutingRule,
  FraudEngineParams,
  GroupsPayload,
  ReferenceListCode,
  ReferenceListItem,
  ReferenceListsPayload,
  RouteTargetResolution,
  RoutingRulesPayload,
  SaveResult,
} from '../domain/types';
import {
  validateEngineTimeout,
  validateOccupationThreshold,
  validateReferenceValue,
  validateRoutingDsl,
} from '../domain/validation';
import type { RiskManagementService } from './risk-management-service';

let refStore: ReferenceListItem[] = REFERENCE_LIST_SEED.map((r) => ({ ...r }));
let occupationStore = OCCUPATION_THRESHOLDS_SEED.map((o) => ({ ...o }));
let groupStore: CaseGroup[] = RM_CASE_GROUPS_SEED.map((g) => ({ ...g, memberIds: [...g.memberIds] }));
let routingStore: CaseRoutingRule[] = CASE_ROUTING_RULES_SEED.map((r) => ({ ...r }));
let paramStore: FraudEngineParams = { ...FRAUD_ENGINE_PARAMS_SEED };
let fraudChecksDisabled = false;
let nextRefId = 100;
let nextAuditId = 1;
let lastAuditId = '';

function now(): string {
  return new Date('2026-05-24T12:00:00Z').toISOString();
}

function guard(role: BackOfficeRole, write = false): SaveResult | null {
  const p = getRiskManagementPermissions(role);
  if (!p.view) return { ok: false, error: 'rm_forbidden' };
  if (write && !p.update) return { ok: false, error: 'rm_forbidden' };
  return null;
}

function appendAudit(entity: string, entityId: string, action: string, role: BackOfficeRole): string {
  const id = `RMA-${nextAuditId++}`;
  lastAuditId = id;
  void getCurrentUser(role);
  return id;
}

function activeItems(code?: ReferenceListCode): ReferenceListItem[] {
  return refStore.filter((i) => !i.effectiveTo && (code == null || i.listCode === code));
}

function computeWorkloads(): Record<string, number> {
  const workloads: Record<string, number> = {};
  for (const c of __getFraudCasesStore()) {
    if (c.assignedUserId && isOpenCase(c.caseStatus)) {
      workloads[c.assignedUserId] = (workloads[c.assignedUserId] ?? 0) + 1;
    }
  }
  return workloads;
}

function staffName(id: string): string {
  return COMPLIANCE_STAFF.find((s) => s.id === id)?.displayName ?? id;
}

export const mockRiskManagementAdapter: RiskManagementService = {
  getReferenceLists(role) {
    if (guard(role)) return { items: [], occupationThresholds: [] };
    return {
      items: refStore.map((i) => ({ ...i })),
      occupationThresholds: occupationStore.map((o) => ({ ...o })),
    };
  },

  saveReferenceLists(payload, role) {
    const g = guard(role, true);
    if (g) return g;
    const at = now();
    for (const code of REFERENCE_LIST_CODES) {
      const incoming = payload.items.filter((i) => i.listCode === code && !i.effectiveTo);
      for (const row of incoming) {
        const v = validateReferenceValue(row.value);
        if (!v.ok) return { ok: false, error: v.error };
      }
      const currentActive = activeItems(code);
      const incomingValues = new Set(incoming.map((i) => i.value.trim()));
      for (const cur of currentActive) {
        if (!incomingValues.has(cur.value)) {
          cur.effectiveTo = at;
        }
      }
      for (const inc of incoming) {
        const val = inc.value.trim();
        if (!currentActive.some((c) => c.value === val && !c.effectiveTo)) {
          refStore.push({
            id: `RL-${nextRefId++}`,
            listCode: code,
            value: val,
            sourceTag: inc.sourceTag ?? 'manual',
            effectiveFrom: at,
            effectiveTo: null,
          });
        }
      }
    }
    for (const row of payload.occupationThresholds) {
      const v = validateOccupationThreshold(row);
      if (!v.ok) return { ok: false, error: v.error };
    }
    occupationStore = payload.occupationThresholds.map((o) => ({ ...o }));
    const auditId = appendAudit('reference_lists', 'all', 'save', role);
    return { ok: true, auditId };
  },

  getGroups(role) {
    if (guard(role)) return { groups: [] };
    return { groups: groupStore.map((g) => ({ ...g, memberIds: [...g.memberIds] })) };
  },

  saveGroups(payload, role) {
    const g = guard(role, true);
    if (g) return g;
    const check = assertGroupsSaveable(payload.groups);
    if (!check.ok) return { ok: false, error: check.error };
    groupStore = payload.groups.map((gr) => ({
      ...gr,
      memberIds: [...gr.memberIds],
      isDefault: gr.isDefault || gr.id === 'GRP_OPERATORS' || gr.id === 'GRP_MANAGERS',
    }));
    const auditId = appendAudit('groups', 'all', 'save', role);
    return { ok: true, auditId };
  },

  getRoutingRules(role) {
    if (guard(role)) return { rules: [] };
    return { rules: routingStore.map((r) => ({ ...r })) };
  },

  saveRoutingRules(payload, role) {
    const g = guard(role, true);
    if (g) return g;
    for (const rule of payload.rules) {
      const v = validateRoutingDsl(rule.conditionDsl);
      if (!v.ok) return { ok: false, error: v.error };
      if (!groupStore.some((gr) => gr.id === rule.targetGroupId)) {
        return { ok: false, error: 'rm_invalid_group' };
      }
    }
    routingStore = payload.rules.map((r) => ({ ...r }));
    const auditId = appendAudit('routing_rules', 'all', 'save', role);
    return { ok: true, auditId };
  },

  getParams(role) {
    if (guard(role)) return { fraud_engine_timeout_ms: '-1' };
    return { ...paramStore };
  },

  saveParams(params, role) {
    const g = guard(role, true);
    if (g) return g;
    const v = validateEngineTimeout(params.fraud_engine_timeout_ms);
    if (!v.ok) return { ok: false, error: v.error };
    paramStore = { ...params };
    fraudChecksDisabled = v.parsed === 0;
    const action = fraudChecksDisabled ? 'fraud_checks_disabled' : 'save';
    const auditId = appendAudit('params', 'fraud_engine_timeout_ms', action, role);
    return { ok: true, auditId };
  },

  listActiveReferenceValues(code) {
    return activeItems(code).map((i) => i.value);
  },

  listAssignableGroups(role) {
    if (guard(role)) return [];
    return groupStore
      .filter((g) => g.type !== 'Operator')
      .map((g) => ({
        ...g,
        memberIds: [...g.memberIds],
        members: g.memberIds.map((userId) => ({ userId, displayName: staffName(userId) })),
      }));
  },

  getEngineTimeout() {
    const v = validateEngineTimeout(paramStore.fraud_engine_timeout_ms);
    return v.ok ? v.parsed : -1;
  },

  isFraudChecksDisabled() {
    return fraudChecksDisabled;
  },

  resolveRoutingTarget(ctx, role) {
    if (guard(role)) return null;
    const sorted = [...routingStore].sort((a, b) => a.sortOrder - b.sortOrder);
    const rule = sorted.find((r) => r.conditionDsl.includes('amount') || r.conditionDsl.length > 0);
    if (!rule) return null;
    const group = groupStore.find((g) => g.id === rule.targetGroupId);
    if (!group || group.memberIds.length === 0) return null;
    const workloads = computeWorkloads();
    const userId = rule.autoDistribute
      ? pickMemberByWorkload(
          group.memberIds.map((userId) => ({ userId })),
          workloads,
        )
      : group.memberIds[0]!;
    if (!userId) return null;
    return { groupId: group.id, userId, autoDistributed: rule.autoDistribute };
  },
};

export function __resetRiskManagementStoreForTest(): void {
  refStore = REFERENCE_LIST_SEED.map((r) => ({ ...r }));
  occupationStore = OCCUPATION_THRESHOLDS_SEED.map((o) => ({ ...o }));
  groupStore = RM_CASE_GROUPS_SEED.map((g) => ({ ...g, memberIds: [...g.memberIds] }));
  routingStore = CASE_ROUTING_RULES_SEED.map((r) => ({ ...r }));
  paramStore = { ...FRAUD_ENGINE_PARAMS_SEED };
  fraudChecksDisabled = false;
  nextRefId = 100;
  nextAuditId = 1;
  lastAuditId = '';
}

export function __getLastRiskManagementAuditId(): string {
  return lastAuditId;
}

export function __isFraudChecksDisabledFlag(): boolean {
  return fraudChecksDisabled;
}

registerRiskManagementApprovalApply((meta) => {
  const { payload, role } = meta;
  mockRiskManagementAdapter.saveReferenceLists(payload.refPayload, role);
  mockRiskManagementAdapter.saveGroups({ groups: payload.groups }, role);
  mockRiskManagementAdapter.saveRoutingRules({ rules: payload.rules }, role);
  mockRiskManagementAdapter.saveParams(payload.params, role);
});
