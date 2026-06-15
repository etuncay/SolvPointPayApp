export type AgentGroupStatus = 'Active' | 'Passive';

export type AgentGroupMaster = {
  id: number;
  groupCode: string;
  name: string;
  description: string;
  commission: number;
  isDefault: boolean;
  status: AgentGroupStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  recordStatus: number;
};

export type AgentGroupMetric = {
  groupCode: string;
  calcDate: string;
  agentCount: number;
  avgFeePerTx: number | null;
  avgTxCountPerAgent: number | null;
};

export type AgentGroupListRow = AgentGroupMaster & {
  agentCount: number;
  avgFeePerTx: number | null;
  avgTxCountPerAgent: number | null;
  calcDate: string | null;
};

export type AgentGroupInput = {
  groupCode: string;
  name: string;
  description: string;
};

export type AgentGroupUpdateInput = {
  name: string;
  description: string;
};

export type AgentGroupFilters = {
  query: string;
  status: string;
};

export const DEFAULT_AGENT_GROUP_FILTERS: AgentGroupFilters = {
  query: '',
  status: 'any',
};

export type AgentGroupPermissions = {
  list: boolean;
  insert: boolean;
  update: boolean;
  deactivate: boolean;
  export: boolean;
};

export type SaveAgentGroupResult = {
  ok: boolean;
  id?: number;
  error?: string;
};

/** Combobox uyumu — agents.ts AgentGroup ile aynı şekil */
export type LegacyAgentGroupOption = {
  key: string;
  label: string;
  commission: number;
};
