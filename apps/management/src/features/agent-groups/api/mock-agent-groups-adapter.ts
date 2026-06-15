import { AGENT_AGENT_METRICS_SEED } from '@/mocks/agent-agent-metrics';
import { buildAgentGroupAssignmentSeed } from '@/mocks/agent-group-assignments';
import { AGENT_GROUP_METRICS_SEED } from '@/mocks/agent-group-metrics';
import { AGENT_GROUP_MASTER_SEED, masterToLegacy } from '@/mocks/agent-groups';
import {
  getAgentsStoreSnapshot,
  upsertAgentListItem,
} from '@/features/agents/api/mock-agents-adapter';
import type { AgentListItem } from '@/features/agents/domain/types';
import { validateAssignAgent } from '../domain/assignment-validation';
import { validateAgentGroupInput, validateAgentGroupUpdate } from '../domain/validation';
import type {
  AgentGroupAssignment,
  AgentOption,
  AssignmentFilters,
  AssignmentListRow,
} from '../domain/assignment-types';
import type {
  AgentGroupFilters,
  AgentGroupInput,
  AgentGroupListRow,
  AgentGroupMaster,
  AgentGroupMetric,
  AgentGroupUpdateInput,
  LegacyAgentGroupOption,
} from '../domain/types';
import type { AgentGroupChangeLogEntry, AgentGroupsService } from './agent-groups-service';

type AgentMetric = {
  agentId: number;
  avgFeePerTx: number | null;
  avgTxCount: number | null;
};

let groupStore: AgentGroupMaster[] = AGENT_GROUP_MASTER_SEED.map((g) => ({ ...g }));
let metricStore: AgentGroupMetric[] = AGENT_GROUP_METRICS_SEED.map((m) => ({ ...m }));
let assignmentStore: AgentGroupAssignment[] = buildAgentGroupAssignmentSeed().map((a) => ({ ...a }));
let agentMetricStore: AgentMetric[] = AGENT_AGENT_METRICS_SEED.map((m) => ({ ...m }));
let nextGroupId = 100;
let nextAssignmentId = 6000;
let nextLogId = 1;
let changeLog: AgentGroupChangeLogEntry[] = [];

function nowIso(): string {
  return new Date().toISOString();
}

function today(): string {
  return nowIso().slice(0, 10);
}

function appendLog(
  action: AgentGroupChangeLogEntry['action'],
  entityId: number,
  previous: unknown,
  next: unknown,
) {
  changeLog = [
    ...changeLog,
    { id: nextLogId++, action, entityId, previous, next, at: nowIso(), by: 'current.user' },
  ];
}

function latestMetric(groupCode: string): AgentGroupMetric | null {
  const rows = metricStore.filter((m) => m.groupCode === groupCode);
  if (rows.length === 0) return null;
  return [...rows].sort((a, b) => b.calcDate.localeCompare(a.calcDate))[0] ?? null;
}

function toListRow(g: AgentGroupMaster): AgentGroupListRow {
  const metric = latestMetric(g.groupCode);
  return {
    ...g,
    agentCount: metric?.agentCount ?? 0,
    avgFeePerTx: metric?.avgFeePerTx ?? null,
    avgTxCountPerAgent: metric?.avgTxCountPerAgent ?? null,
    calcDate: metric?.calcDate ?? null,
  };
}

function sortGroups(rows: AgentGroupListRow[]): AgentGroupListRow[] {
  return [...rows].sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === 'Active') return -1;
      if (b.status === 'Active') return 1;
    }
    return a.groupCode.localeCompare(b.groupCode);
  });
}

function applyGroupFilters(rows: AgentGroupListRow[], filters: AgentGroupFilters): AgentGroupListRow[] {
  const q = filters.query.trim().toLowerCase();
  return rows.filter((g) => {
    if (g.recordStatus !== 1) return false;
    if (filters.status !== 'any' && g.status !== filters.status) return false;
    if (!q) return true;
    return (
      g.groupCode.toLowerCase().includes(q) ||
      g.name.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q)
    );
  });
}

function legacyKeyFromCode(groupCode: string): string {
  return groupCode.toLowerCase();
}

function findGroupMaster(groupCode: string): AgentGroupMaster | null {
  const code = groupCode.trim().toUpperCase();
  return groupStore.find((g) => g.recordStatus === 1 && g.groupCode === code) ?? null;
}

function groupNameFromCode(groupCode: string): string {
  return findGroupMaster(groupCode)?.name ?? groupCode;
}

function getActiveAssignment(agentId: number): AgentGroupAssignment | null {
  return (
    assignmentStore.find(
      (a) => a.agentId === agentId && a.status === 'Active' && a.recordStatus === 1,
    ) ?? null
  );
}

function agentCode(agentId: number): string {
  return `AGT-${String(agentId).padStart(6, '0')}`;
}

function splitCity(cityField: string): { city: string; district: string } {
  const parts = cityField.split(' / ').map((s) => s.trim());
  return { city: parts[0] ?? cityField, district: parts[1] ?? '' };
}

function syncAgentGroupRef(agent: AgentListItem, legacy: LegacyAgentGroupOption): void {
  upsertAgentListItem({ ...agent, group: legacy });
}

function toAssignmentListRow(a: AgentGroupAssignment): AssignmentListRow | null {
  const agent = getAgentsStoreSnapshot().find((x) => x.id === a.agentId && x.recordStatus === 1);
  if (!agent) return null;

  const active = getActiveAssignment(a.agentId);
  const metric = agentMetricStore.find((m) => m.agentId === a.agentId);
  const { city, district } = splitCity(agent.city);

  return {
    id: a.id,
    agentId: a.agentId,
    agentCode: agentCode(a.agentId),
    agentName: agent.name,
    city,
    district,
    avgFeePerTx: metric?.avgFeePerTx ?? null,
    avgTxCount: metric?.avgTxCount ?? null,
    currentGroupName: active ? groupNameFromCode(active.groupCode) : '—',
    currentGroupCode: active?.groupCode ?? '',
    assignedAt: a.assignedAt,
    status: a.status,
    groupCode: a.groupCode,
  };
}

function applyAssignmentFilters(
  rows: AssignmentListRow[],
  filters: AssignmentFilters,
): AssignmentListRow[] {
  const q = filters.query.trim().toLowerCase();
  return rows.filter((r) => {
    if (filters.status !== 'any' && r.status !== filters.status) return false;
    if (!q) return true;
    return (
      r.agentCode.toLowerCase().includes(q) ||
      r.agentName.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.district.toLowerCase().includes(q)
    );
  });
}

function passivateAssignment(assignment: AgentGroupAssignment): AgentGroupAssignment {
  return { ...assignment, status: 'Passive' as const };
}

function createActiveAssignment(agentId: number, groupCode: string): AgentGroupAssignment {
  const ts = nowIso();
  return {
    id: nextAssignmentId++,
    agentId,
    groupCode: groupCode.toUpperCase(),
    assignedAt: ts,
    status: 'Active',
    createdAt: ts,
    createdBy: 'current.user',
    recordStatus: 1,
  };
}

export const mockAgentGroupsAdapter: AgentGroupsService = {
  list(filters = { query: '', status: 'any' }) {
    const rows = groupStore.filter((g) => g.recordStatus === 1).map(toListRow);
    return sortGroups(applyGroupFilters(rows, filters));
  },

  create(input) {
    const err = validateAgentGroupInput(input);
    if (err) return { ok: false, error: err };

    const code = input.groupCode.trim().toUpperCase();
    if (groupStore.some((g) => g.recordStatus === 1 && g.groupCode === code)) {
      return { ok: false, error: 'agg_code_duplicate' };
    }

    const row: AgentGroupMaster = {
      id: nextGroupId++,
      groupCode: code,
      name: input.name.trim(),
      description: input.description.trim(),
      commission: 1.0,
      isDefault: false,
      status: 'Active',
      createdAt: nowIso(),
      createdBy: 'current.user',
      updatedAt: nowIso(),
      updatedBy: 'current.user',
      recordStatus: 1,
    };
    groupStore = [...groupStore, row];
    metricStore = [
      ...metricStore,
      {
        groupCode: code,
        calcDate: today(),
        agentCount: 0,
        avgFeePerTx: null,
        avgTxCountPerAgent: null,
      },
    ];
    appendLog('create', row.id, null, row);
    return { ok: true, id: row.id };
  },

  update(id, input) {
    const existing = groupStore.find((g) => g.id === id && g.recordStatus === 1);
    if (!existing) return { ok: false, error: 'finrec_not_found' };
    if (existing.status === 'Passive') return { ok: false, error: 'agg_passive_readonly' };

    const err = validateAgentGroupUpdate(input);
    if (err) return { ok: false, error: err };

    const row: AgentGroupMaster = {
      ...existing,
      name: input.name.trim(),
      description: input.description.trim(),
      updatedAt: nowIso(),
      updatedBy: 'current.user',
    };
    groupStore = groupStore.map((g) => (g.id === id ? row : g));
    appendLog('update', id, existing, row);
    return { ok: true, id };
  },

  deactivate(id) {
    const existing = groupStore.find((g) => g.id === id && g.recordStatus === 1);
    if (!existing) return { ok: false, error: 'finrec_not_found' };
    if (existing.status === 'Passive') return { ok: true, id };

    if (existing.isDefault) return { ok: false, error: 'agg_default_protected' };

    const activeCount = mockAgentGroupsAdapter.countActiveAgents(existing.groupCode);
    if (activeCount > 0) return { ok: false, error: 'agg_has_active_agents' };

    const row: AgentGroupMaster = {
      ...existing,
      status: 'Passive',
      updatedAt: nowIso(),
      updatedBy: 'current.user',
    };
    groupStore = groupStore.map((g) => (g.id === id ? row : g));
    appendLog('deactivate', id, existing, row);
    return { ok: true, id };
  },

  listActiveLegacy(): LegacyAgentGroupOption[] {
    return groupStore
      .filter((g) => g.recordStatus === 1 && g.status === 'Active')
      .map(masterToLegacy);
  },

  countActiveAgents(groupCode: string) {
    const code = groupCode.trim().toUpperCase();
    return assignmentStore.filter(
      (a) => a.recordStatus === 1 && a.status === 'Active' && a.groupCode === code,
    ).length;
  },

  getDefaultGroup(): LegacyAgentGroupOption {
    const def =
      groupStore.find((g) => g.recordStatus === 1 && g.isDefault && g.status === 'Active') ??
      groupStore.find((g) => g.recordStatus === 1 && g.groupCode === 'STANDARD')!;
    return masterToLegacy(def);
  },

  getByCode(groupCode: string) {
    const code = groupCode.trim().toUpperCase();
    const row = groupStore.find((g) => g.recordStatus === 1 && g.groupCode === code);
    return row ? toListRow(row) : null;
  },

  runDailyMetricsBatch() {
    const date = today();
    let count = 0;
    for (const g of groupStore.filter((x) => x.recordStatus === 1 && x.status === 'Active')) {
      const liveCount = mockAgentGroupsAdapter.countActiveAgents(g.groupCode);
      const prev = latestMetric(g.groupCode);
      const next: AgentGroupMetric = {
        groupCode: g.groupCode,
        calcDate: date,
        agentCount: liveCount,
        avgFeePerTx: prev?.avgFeePerTx ?? null,
        avgTxCountPerAgent: prev?.avgTxCountPerAgent ?? null,
      };
      metricStore = [...metricStore, next];
      count += 1;
      appendLog('metrics_batch', g.id, prev, next);
    }
    return count;
  },

  listGroupAssignments(groupCode, filters = { query: '', status: 'Active' }) {
    const code = groupCode.trim().toUpperCase();
    const rows = assignmentStore
      .filter((a) => a.recordStatus === 1 && a.groupCode === code)
      .map(toAssignmentListRow)
      .filter((r): r is AssignmentListRow => r != null)
      .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt));

    return applyAssignmentFilters(rows, filters);
  },

  listAgentOptions() {
    return getAgentsStoreSnapshot()
      .filter((a) => a.recordStatus === 1)
      .map((a) => {
        const active = getActiveAssignment(a.id);
        return {
          id: a.id,
          code: agentCode(a.id),
          name: a.name,
          city: a.city,
          activeGroupCode: active?.groupCode ?? null,
        } satisfies AgentOption;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  },

  assignAgentToGroup(groupCode, agentId) {
    const err = validateAssignAgent(agentId);
    if (err) return { ok: false, error: err };

    const code = groupCode.trim().toUpperCase();
    const group = findGroupMaster(code);
    if (!group) return { ok: false, error: 'finrec_not_found' };
    if (group.status === 'Passive') return { ok: false, error: 'aga_passive_group' };

    const agent = getAgentsStoreSnapshot().find((a) => a.id === agentId && a.recordStatus === 1);
    if (!agent) return { ok: false, error: 'af_not_found' };

    const current = getActiveAssignment(agentId);
    if (current?.groupCode === code) {
      return { ok: true, id: current.id, noOp: true };
    }

    const prevActive = current ? { ...current } : null;
    if (current) {
      const passive = passivateAssignment(current);
      assignmentStore = assignmentStore.map((a) => (a.id === current.id ? passive : a));
      appendLog('assign', current.id, prevActive, passive);
    }

    const next = createActiveAssignment(agentId, code);
    assignmentStore = [...assignmentStore, next];
    appendLog('assign', next.id, prevActive, next);

    const legacy = masterToLegacy(group);
    syncAgentGroupRef(agent, legacy);

    return { ok: true, id: next.id };
  },

  removeAgentFromGroup(assignmentId) {
    const assignment = assignmentStore.find(
      (a) => a.id === assignmentId && a.recordStatus === 1,
    );
    if (!assignment) return { ok: false, error: 'aga_assignment_not_found' };
    if (assignment.status === 'Passive') return { ok: true };

    const prev = { ...assignment };
    const passive = passivateAssignment(assignment);
    assignmentStore = assignmentStore.map((a) => (a.id === assignmentId ? passive : a));
    appendLog('remove', assignmentId, prev, passive);

    const agent = getAgentsStoreSnapshot().find(
      (a) => a.id === assignment.agentId && a.recordStatus === 1,
    );
    if (!agent) return { ok: true };

    const stillActive = getActiveAssignment(assignment.agentId);
    if (stillActive) {
      const legacy = masterToLegacy(findGroupMaster(stillActive.groupCode)!);
      syncAgentGroupRef(agent, legacy);
      return { ok: true };
    }

    const def = mockAgentGroupsAdapter.getDefaultGroup();
    const defCode = def.key.toUpperCase();
    const next = createActiveAssignment(assignment.agentId, defCode);
    assignmentStore = [...assignmentStore, next];
    appendLog('assign', next.id, null, next);
    syncAgentGroupRef(agent, def);

    return { ok: true };
  },

  syncAssignmentFromAgentGroup(agentId, groupKey) {
    const code = groupKey.trim().toUpperCase();
    mockAgentGroupsAdapter.assignAgentToGroup(code, agentId);
  },
};

export function getAgentGroupChangeLog(): AgentGroupChangeLogEntry[] {
  return [...changeLog];
}

export function resetAgentGroupsStore(): void {
  groupStore = AGENT_GROUP_MASTER_SEED.map((g) => ({ ...g }));
  metricStore = AGENT_GROUP_METRICS_SEED.map((m) => ({ ...m }));
  assignmentStore = buildAgentGroupAssignmentSeed().map((a) => ({ ...a }));
  agentMetricStore = AGENT_AGENT_METRICS_SEED.map((m) => ({ ...m }));
  nextGroupId = 100;
  nextAssignmentId = 6000;
  nextLogId = 1;
  changeLog = [];
}

/** agent-form save sonrası assignment senkronu */
export function syncAssignmentFromAgentGroup(agentId: number, groupKey: string): void {
  mockAgentGroupsAdapter.syncAssignmentFromAgentGroup(agentId, groupKey);
}

/** groupKey (legacy) → legacy grup — agent-form adapter */
export function legacyGroupFromKey(key: string): LegacyAgentGroupOption {
  const normalized = key.trim().toLowerCase();
  const legacy = mockAgentGroupsAdapter.listActiveLegacy();
  return legacy.find((g) => g.key === normalized) ?? mockAgentGroupsAdapter.getDefaultGroup();
}

/** Test — tek aktif atama invariant */
export function getActiveAssignmentForTest(agentId: number): AgentGroupAssignment | null {
  return getActiveAssignment(agentId);
}

/** Test — assignment store snapshot */
export function getAssignmentStoreSnapshot(): AgentGroupAssignment[] {
  return assignmentStore.map((a) => ({ ...a }));
}
