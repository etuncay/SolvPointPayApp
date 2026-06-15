import { AGENT_FEES } from '@/mocks/agent-fees';
import { agentGroupsService } from '@/features/agent-groups/api';
import { calculateAgentFee, hasActiveBaseTier } from '../domain/calculate-agent-fee';
import { sortAgentFees } from '../domain/sort-agent-fees';
import {
  agentFeeComboKey,
  DEFAULT_AGENT_FEE_FILTERS,
  type AgentFee,
  type AgentFeeFilters,
  type AgentFeeInput,
  type AgentFeeUpdateInput,
} from '../domain/types';
import { validateAgentFeeInput, validateAgentFeeUpdate } from '../domain/validation';
import type { AgentFeeChangeLogEntry, AgentFeesService } from './agent-fees-service';
import { registerAgentFeeApprovalApply } from './agent-fee-approval-bridge';

let store: AgentFee[] = AGENT_FEES.map((f) => ({ ...f }));
let nextId = 4000;
let nextLogId = 1;
let changeLog: AgentFeeChangeLogEntry[] = [];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowIso(): string {
  return new Date().toISOString();
}

function appendLog(
  action: AgentFeeChangeLogEntry['action'],
  feeId: number,
  previous: AgentFee | null,
  next: AgentFee | null,
) {
  changeLog = [
    ...changeLog,
    {
      id: nextLogId++,
      action,
      feeId,
      previous: previous ? { ...previous } : null,
      next: next ? { ...next } : null,
      at: nowIso(),
      by: 'current.user',
    },
  ];
}

function passivateFee(id: number, endDate: string): AgentFee | null {
  const idx = store.findIndex((f) => f.id === id);
  if (idx < 0) return null;
  const prev = store[idx]!;
  if (prev.status === 'Passive') return prev;
  const next: AgentFee = {
    ...prev,
    status: 'Passive',
    endDate: prev.endDate ?? endDate,
    changedAt: nowIso(),
    changedBy: 'current.user',
  };
  store = store.map((f, i) => (i === idx ? next : f));
  appendLog('passivate', id, prev, next);
  return next;
}

function applyFilters(rows: AgentFee[], filters: AgentFeeFilters): AgentFee[] {
  const q = filters.query.trim().toLowerCase();
  return rows.filter((f) => {
    if (f.recordStatus !== 1) return false;
    if (filters.groupCode !== 'any' && f.groupCode !== filters.groupCode.toUpperCase()) return false;
    if (filters.transactionType !== 'any' && f.transactionType !== filters.transactionType) return false;
    if (filters.currency !== 'any' && f.currency !== filters.currency) return false;
    if (filters.status !== 'any' && f.status !== filters.status) return false;
    if (!q) return true;
    return (
      f.groupCode.toLowerCase().includes(q) ||
      f.transactionType.toLowerCase().includes(q) ||
      f.currency.toLowerCase().includes(q)
    );
  });
}

function buildRow(input: AgentFeeInput, id: number): AgentFee {
  const ts = nowIso();
  return {
    id,
    groupCode: input.groupCode.toUpperCase(),
    transactionType: input.transactionType,
    currency: input.currency,
    lowerLimit: input.lowerLimit,
    fixedFee: input.fixedFee,
    variableFeePct: input.variableFeePct,
    startDate: input.startDate?.trim() || today(),
    endDate: input.endDate?.trim() || null,
    status: 'Active',
    changedBy: 'current.user',
    changedAt: ts,
    recordStatus: 1,
  };
}

function assertGroupActive(groupCode: string): string | null {
  const group = agentGroupsService.getByCode(groupCode);
  if (!group) return 'afee_group_not_found';
  if (group.status === 'Passive') return 'afee_passive_group';
  return null;
}

function passivateConflicting(input: AgentFeeInput): void {
  const key = agentFeeComboKey(input);
  const date = today();
  for (const f of store) {
    if (f.recordStatus !== 1 || f.status !== 'Active') continue;
    if (agentFeeComboKey(f) === key) {
      passivateFee(f.id, date);
    }
  }
}

function passivateIdsForCreate(input: AgentFeeInput): number[] {
  const key = agentFeeComboKey(input);
  return store
    .filter((f) => f.recordStatus === 1 && f.status === 'Active' && agentFeeComboKey(f) === key)
    .map((f) => f.id);
}

function passivateIdsForUpdate(id: number, input: AgentFeeInput): number[] {
  const key = agentFeeComboKey(input);
  const ids = new Set<number>([id]);
  for (const f of store) {
    if (f.id === id) continue;
    if (f.recordStatus !== 1 || f.status !== 'Active') continue;
    if (agentFeeComboKey(f) === key) ids.add(f.id);
  }
  return [...ids];
}

function assertBaseTierPreserved(input: AgentFeeInput, passivateIds: number[]): string | null {
  const date = today();
  const after = [
    ...store.map((f) =>
      passivateIds.includes(f.id) ? { ...f, status: 'Passive' as const } : f,
    ),
    buildRow(input, -1),
  ];
  if (!hasActiveBaseTier(after, input.groupCode, input.transactionType, input.currency, date)) {
    return 'afee_base_tier_required';
  }
  return null;
}

export const mockAgentFeesAdapter: AgentFeesService = {
  list(filters = DEFAULT_AGENT_FEE_FILTERS) {
    mockAgentFeesAdapter.runBatchExpire();
    return sortAgentFees(applyFilters(store, filters));
  },

  create(input) {
    const normalized: AgentFeeInput = { ...input, groupCode: input.groupCode.toUpperCase() };
    const groupErr = assertGroupActive(normalized.groupCode);
    if (groupErr) return { ok: false, error: groupErr };

    const err = validateAgentFeeInput(normalized);
    if (err) return { ok: false, error: err };

    const passivateIds = passivateIdsForCreate(normalized);
    const tierErr = assertBaseTierPreserved(normalized, passivateIds);
    if (tierErr) return { ok: false, error: tierErr };

    passivateConflicting(normalized);
    const row = buildRow(normalized, nextId++);
    store = [...store, row];
    appendLog('create', row.id, null, row);
    return { ok: true, id: row.id };
  },

  update(id, input) {
    const existing = store.find((f) => f.id === id && f.recordStatus === 1);
    if (!existing) return { ok: false, error: 'finrec_not_found' };
    if (existing.status === 'Passive') return { ok: false, error: 'cfe_passive_readonly' };

    const err = validateAgentFeeUpdate(input);
    if (err) return { ok: false, error: err };

    const fullInput: AgentFeeInput = {
      groupCode: existing.groupCode,
      transactionType: existing.transactionType,
      currency: existing.currency,
      lowerLimit: existing.lowerLimit,
      fixedFee: input.fixedFee,
      variableFeePct: input.variableFeePct,
      startDate: input.startDate?.trim() || existing.startDate,
      endDate: input.endDate?.trim() || null,
    };

    const passivateIds = passivateIdsForUpdate(id, fullInput);
    const tierErr = assertBaseTierPreserved(fullInput, passivateIds);
    if (tierErr) return { ok: false, error: tierErr };

    const date = today();
    passivateFee(id, date);
    passivateConflicting(fullInput);
    const row = buildRow(fullInput, nextId++);
    store = [...store, row];
    appendLog('update', row.id, existing, row);
    return { ok: true, id: row.id };
  },

  calculate(params) {
    mockAgentFeesAdapter.runBatchExpire();
    return calculateAgentFee(store, { ...params, groupCode: params.groupCode.toUpperCase() });
  },

  runBatchExpire() {
    const date = today();
    let count = 0;
    store = store.map((f) => {
      if (f.recordStatus !== 1 || f.status !== 'Active') return f;
      const futureStart = f.startDate && f.startDate > date;
      const pastEnd = f.endDate && f.endDate < date;
      if (!futureStart && !pastEnd) return f;
      count += 1;
      const prev = { ...f };
      const next: AgentFee = {
        ...f,
        status: 'Passive',
        changedAt: nowIso(),
        changedBy: 'system.batch',
      };
      appendLog('batch_expire', f.id, prev, next);
      return next;
    });
    return count;
  },

  hasActiveConflict(input) {
    const key = agentFeeComboKey({ ...input, groupCode: input.groupCode.toUpperCase() });
    return store.some(
      (f) => f.recordStatus === 1 && f.status === 'Active' && agentFeeComboKey(f) === key,
    );
  },
};

export function getAgentFeeChangeLog(): AgentFeeChangeLogEntry[] {
  return [...changeLog];
}

export function resetAgentFeesStore(): void {
  store = AGENT_FEES.map((f) => ({ ...f }));
  nextId = 4000;
  nextLogId = 1;
  changeLog = [];
}

registerAgentFeeApprovalApply((meta) => {
  if (meta.mode === 'new') {
    mockAgentFeesAdapter.create(meta.input);
    return;
  }
  mockAgentFeesAdapter.update(meta.feeId, meta.input);
});
