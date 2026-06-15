import type { Agent, AgentGroup, SettlementFrequency } from '@/mocks/agents';

export type { Agent, AgentGroup, SettlementFrequency };

export type EntityStatus = Agent['status'];

export type EntityStatusFilter = EntityStatus | 'all';

export type AgentListItem = Agent;

export type AgentAdvFilters = {
  group: string;
  settlement: string;
  balance: string;
  from: string;
  to: string;
};

export type AgentFilters = {
  status: EntityStatusFilter;
  query: string;
  advanced: AgentAdvFilters;
};

export type AgentCounts = Record<EntityStatusFilter, number>;

export type AgentDashboardStats = {
  active: number;
  totalTRY: number;
  lowBal: number;
  negBal: number;
  blocked: number;
  txToday: number;
  visibleTotal: number;
};

export type AgentListResult = {
  rows: AgentListItem[];
  total: number;
  counts: AgentCounts;
  stats: AgentDashboardStats;
};

export type AgentPermissions = {
  list: boolean;
  view: boolean;
  insert: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
};

export const EMPTY_ADV_FILTERS: AgentAdvFilters = {
  group: 'any',
  settlement: 'any',
  balance: 'any',
  from: '',
  to: '',
};

export const DEFAULT_AGENT_FILTERS: AgentFilters = {
  status: 'active',
  query: '',
  advanced: EMPTY_ADV_FILTERS,
};

export const LOW_TRY_BALANCE = 5000;
